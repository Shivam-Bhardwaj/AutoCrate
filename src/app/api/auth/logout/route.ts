import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export interface LogoutRequest {
  type: 'console' | 'terminal'
}

export async function POST(request: Request) {
  try {
    const body: LogoutRequest = await request.json()

    if (!body.type || (body.type !== 'console' && body.type !== 'terminal')) {
      return NextResponse.json(
        { success: false, message: 'Invalid type' },
        { status: 400 }
      )
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear the authentication cookie
    response.cookies.set({
      name: `auth_token_${body.type}`,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}