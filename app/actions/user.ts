'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'

export async function toggleUserRole(userId: number) {
  const session = await requireAdmin()

  if (Number(session.user.id) === userId) {
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
