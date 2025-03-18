import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access protected routes
  if (!session) {
    if (req.nextUrl.pathname.startsWith('/chat')) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // If there's a session and the user is trying to access auth pages
    if (req.nextUrl.pathname === '/') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/chat'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/', '/chat/:path*'],
} 