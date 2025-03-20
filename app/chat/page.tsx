'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store'
import { ChatComponent } from '@/components/chat'

export default function ChatPage() {
  const router = useRouter()
  const { user, ready: authReady, loading: authLoading } = useAuth()
  const store = useStore()
  const [error, setError] = useState<string | null>(null)
  const [initializationAttempts, setInitializationAttempts] = useState(0)

  const initializeStore = useCallback(async () => {
    if (!authReady || !user) {
      console.log('ChatPage: Auth not ready or no user')
      return
    }

    if (store.initialized) {
      console.log('ChatPage: Store already initialized')
      return
    }

    if (store.isInitializing) {
      console.log('ChatPage: Store is initializing')
      return
    }

    if (initializationAttempts >= 3) {
      console.error('ChatPage: Failed to initialize after multiple attempts')
      setError('Failed to initialize after multiple attempts')
      return
    }

    try {
      console.log('ChatPage: Attempting to initialize store')
      setInitializationAttempts(prev => prev + 1)
      await store.initialize()
      console.log('ChatPage: Store initialized successfully')
    } catch (error) {
      console.error('ChatPage: Store initialization failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize store')
    }
  }, [authReady, user, store, initializationAttempts])

  useEffect(() => {
    console.log('ChatPage: Auth state changed', { authReady, hasUser: !!user, authLoading })
    initializeStore()
  }, [authReady, user, store.initialized, store.isInitializing, initializeStore, initializationAttempts, authLoading])

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!authReady || !user) {
    console.log('ChatPage: No user, redirecting to home')
    router.replace('/')
    return null
  }

  if (error || store.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 p-4 bg-red-100 rounded-lg">
          {error || store.error}
        </div>
      </div>
    )
  }

  return <ChatComponent />
} 