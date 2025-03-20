'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  ready: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const mountedRef = useRef(false)

  const handleAuthStateChange = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Auth: Getting initial session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth: Session fetch error:', error)
        if (mountedRef.current) {
          setUser(null)
          setLoading(false)
          setReady(true)
        }
        return
      }

      console.log('Auth: Initial session:', {
        hasUser: !!session?.user,
        userId: session?.user?.id,
        path: pathname
      })

      if (session?.user) {
        if (mountedRef.current) {
          setUser(session.user)
          setLoading(false)
          setReady(true)
        }

        if (pathname === '/') {
          console.log('Auth: Redirecting to /chat')
          router.replace('/chat')
        }
      } else {
        if (mountedRef.current) {
          setUser(null)
          setLoading(false)
          setReady(true)
        }

        if (pathname !== '/' && pathname !== '/auth/callback') {
          console.log('Auth: Redirecting to /')
          router.replace('/')
        }
      }
    } catch (error) {
      console.error('Auth: Error getting session:', error)
      if (mountedRef.current) {
        setUser(null)
        setLoading(false)
        setReady(true)
      }
    }
  }, [pathname, router])

  // Initialize auth and handle state changes
  useEffect(() => {
    mountedRef.current = true
    console.log('Auth: Setting up auth state change listener')
    
    // Get initial session first
    handleAuthStateChange()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth: State change:', { 
          event, 
          userId: session?.user?.id,
          path: pathname
        })

        if (!mountedRef.current) return

        // Only handle SIGNED_IN and SIGNED_OUT events
        if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
          return
        }

        if (session?.user) {
          console.log('Auth: User authenticated')
          setUser(session.user)
          setLoading(false)
          setReady(true)
          
          if (pathname === '/') {
            console.log('Auth: Redirecting to /chat')
            router.replace('/chat')
          }
        } else {
          console.log('Auth: No user')
          setUser(null)
          setLoading(false)
          setReady(true)
          
          if (pathname !== '/' && pathname !== '/auth/callback') {
            console.log('Auth: Redirecting to /')
            router.replace('/')
          }
        }
      }
    )

    // Store the subscription reference
    subscriptionRef.current = subscription

    return () => {
      console.log('Auth: Cleaning up auth state change listener')
      mountedRef.current = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [pathname, router])

  const signInWithGoogle = async () => {
    try {
      console.log('Auth: Starting Google sign in...')
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Auth: Error signing in with Google:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('Auth: Starting sign out...')
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace('/')
    } catch (error) {
      console.error('Auth: Error signing out:', error)
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, ready, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 