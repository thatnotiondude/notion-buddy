import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('Middleware: Auth state:', {
      hasSession: !!session,
      error: error?.message,
      path: req.nextUrl.pathname
    })

    // If there's no session and the user is trying to access protected routes
    if (!session) {
      if (req.nextUrl.pathname.startsWith('/chat')) {
        console.log('Middleware: Redirecting to home page - no session')
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // If there's a session and the user is trying to access auth pages
      if (req.nextUrl.pathname === '/') {
        console.log('Middleware: Redirecting to chat - has session')
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/chat'
        return NextResponse.redirect(redirectUrl)
      }
    }

    return res
  } catch (error) {
    console.error('Middleware: Error checking auth state:', error)
    // On error, allow the request to proceed
    return res
  }
}

export const config = {
  matcher: ['/', '/chat/:path*'],
} 