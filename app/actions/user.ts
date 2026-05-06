'use server'

import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { revalidatePath } from 'next/cache'

export async function toggleUserRole(userId: number) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  // ป้องกันไม่ให้ลด role ตัวเอง
  if (session.user.id === userId) {
    throw new Error('ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('ไม่พบผู้ใช้')

  await prisma.user.update({
    where: { id: userId },
    data: { role: user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' },
  })

  revalidatePath('/dashboard/users')
}
