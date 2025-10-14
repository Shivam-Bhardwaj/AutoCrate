import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-CHANGE-IN-PRODUCTION'

export interface VerifyResponse {
  authenticated: boolean
  type?: 'console' | 'terminal'
}

export async function GET(request: Request) {
  try {
    // Get the URL to determine which type to check
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as 'console' | 'terminal' | null

    if (!type || (type !== 'console' && type !== 'terminal')) {
      return NextResponse.json<VerifyResponse>(
        { authenticated: false },
        { status: 400 }
      )
    }

    // Get the authentication cookie
    const cookieName = `auth_token_${type}`
    const token = request.headers
      .get('cookie')
      ?.split('; ')
      .find(row => row.startsWith(`${cookieName}=`))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json<VerifyResponse>(
        { authenticated: false },
        { status: 401 }
      )
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        type: 'console' | 'terminal'
        ip: string
        timestamp: number
      }

      // Check if token type matches requested type
      if (decoded.type !== type) {
        return NextResponse.json<VerifyResponse>(
          { authenticated: false },
          { status: 401 }
        )
      }

      return NextResponse.json<VerifyResponse>(
        { authenticated: true, type: decoded.type },
        { status: 200 }
      )
    } catch (jwtError) {
      // Token is invalid or expired
      return NextResponse.json<VerifyResponse>(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json<VerifyResponse>(
      { authenticated: false },
      { status: 500 }
    )
  }
}