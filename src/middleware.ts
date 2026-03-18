import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateSessionFromRequest } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Only protect admin sub-pages, not the login page itself
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin/')
  const isLoginPage = request.nextUrl.pathname === '/admin'
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin/')
  const isLoginApi = request.nextUrl.pathname === '/api/admin/login'

  if ((isAdminPage || (isAdminApi && !isLoginApi)) && !isLoginPage) {
    if (!validateSessionFromRequest(request)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
