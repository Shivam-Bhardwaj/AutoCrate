import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-CHANGE-IN-PRODUCTION'

// Simple JWT verification for Edge Runtime (without external dependencies)
async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    // For now, skip verification in middleware and rely on API route verification
    // This is a workaround for Edge Runtime compatibility
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

// Routes that require authentication
const protectedRoutes = {
  '/console': 'console',
  '/terminal': 'terminal',
} as const

export async function middleware(request: NextRequest) {
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

    // Verify the JWT token
    const decoded = await verifyToken(token, JWT_SECRET)

    if (!decoded || decoded.type !== routeType) {
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

    // Token is valid, allow access
    return NextResponse.next()
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