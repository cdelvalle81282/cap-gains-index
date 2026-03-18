import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password === process.env.ADMIN_PASSWORD) {
    await createSession()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
