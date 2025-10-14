import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-CHANGE-IN-PRODUCTION'

// Routes that require authentication
const protectedRoutes = {
  '/console': 'console',
  '/terminal': 'terminal',
} as const

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if this is a protected route
  const routeType = protectedRoutes[pathname as keyof typeof protectedRoutes]

  if (routeType) {
    // Get the authentication cookie
    const cookieName = `auth_token_${routeType}`
    const token = request.cookies.get(cookieName)?.value

    if (!token) {
      // No token, redirect to login (show the same page with auth form)
      // We'll handle this client-side to avoid redirect loops
      const response = NextResponse.next()
      response.headers.set('x-auth-required', 'true')
      return response
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        type: 'console' | 'terminal'
        ip: string
        timestamp: number
      }

      // Check if token type matches route type
      if (decoded.type !== routeType) {
        const response = NextResponse.next()
        response.headers.set('x-auth-required', 'true')
        return response
      }

      // Token is valid, allow access
      return NextResponse.next()
    } catch (error) {
      // Token is invalid or expired
      const response = NextResponse.next()
      response.headers.set('x-auth-required', 'true')

      // Clear the invalid cookie
      response.cookies.set({
        name: cookieName,
        value: '',
        maxAge: 0,
        path: '/'
      })

      return response
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Allow inline scripts for Next.js
      "style-src 'self' 'unsafe-inline'; " + // Allow inline styles
      "img-src 'self' data: blob:; " + // Allow data URIs and blob URLs for images
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).+)',
  ],
}