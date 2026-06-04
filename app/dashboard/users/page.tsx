import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

const ROLE_ORDER: Record<string, number> = { SUPERADMIN: 0, ADMIN: 1, MEMBER: 2 }

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  users.sort((a, b) => {
    const rankDiff = (ROLE_ORDER[a.role] ?? 3) - (ROLE_ORDER[b.role] ?? 3)
    return rankDiff !== 0 ? rankDiff : b.createdAt.getTime() - a.createdAt.getTime()
  })

  const currentUserId = Number(session.user.id)
  const currentUserRole = session.user.role as string

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-gray-500 mt-0.5">กำหนดสิทธิ์การเข้าถึงข้อมูลระบบ (Admin / Member)</p>
      </div>
      <UsersClient initialUsers={users} currentUserId={currentUserId} currentUserRole={currentUserRole} />
    </div>
  )
}
