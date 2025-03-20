import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

export async function auth() {
  const session = await getServerSession(authOptions)
  return session
}

export type Session = Awaited<ReturnType<typeof auth>> 