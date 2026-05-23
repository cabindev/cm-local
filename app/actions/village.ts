'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createVillage(data: {
  villageName: string
  villageNo: string
  tambon: string
  amphoe: string
  province: string
  zone: string
  coordinator: string
  phone?: string
  registeredPopulation?: number
  actualPopulation?: number
  householdCount?: number
}) {
  const session = await requireAdmin()

  // Verify user exists in DB before setting FK (session may outlive a DB reset)
  const userId = Number(session.user.id)
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })

  const village = await prisma.village.create({
    data: {
      ...data,
      registeredPopulation: data.registeredPopulation ?? 0,
      actualPopulation: data.actualPopulation ?? 0,
      householdCount: data.householdCount ?? 0,
      creatorId: userExists ? userId : null,
    },
  })
  revalidatePath('/dashboard/villages')
  return village
}

export async function updateVillage(
  id: number,
  data: {
    villageName?: string
    villageNo?: string
    tambon?: string
    amphoe?: string
    province?: string
    zone?: string
    coordinator?: string
    phone?: string
    registeredPopulation?: number
    actualPopulation?: number
    householdCount?: number
  }
) {
  await requireAdmin()

  const village = await prisma.village.update({ where: { id }, data })
  revalidatePath('/dashboard/villages')
  revalidatePath(`/dashboard/villages/${id}`)
  return village
}

export async function deleteVillage(id: number) {
  const session = await requireAdmin()

  const village = await prisma.village.findUnique({ where: { id }, select: { creatorId: true } })
  if (!village) throw new Error('ไม่พบหมู่บ้าน')
  if (village.creatorId !== Number(session.user.id)) {
    throw new Error('ไม่มีสิทธิ์ลบหมู่บ้านที่สร้างโดยผู้ใช้อื่น')
  }

  await prisma.village.delete({ where: { id } })
  revalidatePath('/dashboard/villages')
}

export async function getVillages() {
  await requireAdmin()

  return prisma.village.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { persons: true } },
    },
  })
}

export async function getVillage(id: number) {
  return prisma.village.findUnique({
    where: { id },
    include: {
      screeningResults: { orderBy: { year: 'asc' } },
      communityBackgrounds: true,
      envItems: true,
      communityOrgs: true,
      persons: {
        orderBy: { createdAt: 'desc' },
        include: {
          alcohol: { select: { drinkType: true, statusY1: true, statusY2: true, statusY3: true } },
          tobacco: { select: { smokeType: true,  statusY1: true, statusY2: true, statusY3: true } },
          dnd:     { select: { drinkType: true, year1Result: true, year2Result: true, year3Result: true } },
        },
      },
    },
  })
}
