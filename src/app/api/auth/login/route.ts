import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authRateLimit } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

// Server-side environment variables (not exposed to client)
const CONSOLE_PASSWORD_HASH = process.env.CONSOLE_PASSWORD_HASH || bcrypt.hashSync('default-console-password', 10)
const TERMINAL_PASSWORD_HASH = process.env.TERMINAL_PASSWORD_HASH || bcrypt.hashSync('default-terminal-password', 10)
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-CHANGE-IN-PRODUCTION'

// Token expiry time (1 hour)
const TOKEN_EXPIRY = '1h'

export interface LoginRequest {
  password: string
  type: 'console' | 'terminal'
}

export interface LoginResponse {
  success: boolean
  message?: string
}

async function handler(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    // Validate request body
    if (!body.password || !body.type) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password type
    if (body.type !== 'console' && body.type !== 'terminal') {
      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Invalid authentication type' },
        { status: 400 }
      )
    }

    // Rate limiting check (simple implementation - in production use proper rate limiter)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'

    // Select the correct password hash based on type
    const passwordHash = body.type === 'console' ? CONSOLE_PASSWORD_HASH : TERMINAL_PASSWORD_HASH

    // Verify password
    const isValid = await bcrypt.compare(body.password, passwordHash)

    if (!isValid) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000))

      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      {
        type: body.type,
        ip: clientIp,
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    )

    // Create response with secure cookie
    const response = NextResponse.json<LoginResponse>(
      { success: true },
      { status: 200 }
    )

    // Set HttpOnly, Secure, SameSite cookie
    response.cookies.set({
      name: `auth_token_${body.type}`,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour in seconds
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json<LoginResponse>(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Export POST with rate limiting
export async function POST(request: NextRequest) {
  return authRateLimit(request, handler)
}