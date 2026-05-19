import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
  return session
}
