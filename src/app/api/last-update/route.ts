import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { execSync } = await import('node:child_process')
    const output = execSync('git log -1 --format=%cI', { encoding: 'utf-8' }).trim()

    return NextResponse.json({ lastUpdate: output })
  } catch (error) {
    const fallback = new Date().toISOString()
    return NextResponse.json({ lastUpdate: fallback, error: 'git metadata unavailable' }, { status: 200 })
  }
}
