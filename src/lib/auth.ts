import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SESSION_COOKIE = 'admin_session'
const SESSION_TOKEN = 'authenticated' // Simple token for password gate

export async function createSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export function validateSessionFromRequest(request: NextRequest): boolean {
  const session = request.cookies.get(SESSION_COOKIE)
  return session?.value === SESSION_TOKEN
}
