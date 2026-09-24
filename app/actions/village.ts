'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendTelegram } from '@/app/lib/telegram'

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
  isKpiVillage?: boolean
  isQualityVillage?: boolean
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
    isKpiVillage?: boolean
    isQualityVillage?: boolean
  }
) {
  await requireAdmin()

  const village = await prisma.village.update({ where: { id }, data })
  revalidatePath('/dashboard/villages')
  revalidatePath(`/dashboard/villages/${id}`)
  return village
}

// ลบได้เฉพาะเจ้าของหมู่บ้าน หรือ SUPERADMIN — ข้อมูลที่ผูกอยู่ถูกลบตาม (onDelete: Cascade)
export async function deleteVillage(id: number, confirmName?: string) {
  const session = await requireAdmin()

  const village = await prisma.village.findUnique({
    where: { id },
    select: {
      creatorId: true, villageName: true, villageNo: true,
      tambon: true, amphoe: true, province: true,
      _count: { select: { persons: true } },
    },
  })
  if (!village) throw new Error('ไม่พบหมู่บ้าน')

  const isOwner = village.creatorId === Number(session.user.id)
  const isSuperAdmin = session.user.role === 'SUPERADMIN'
  if (!isOwner && !isSuperAdmin) {
    throw new Error('ไม่มีสิทธิ์ลบหมู่บ้านที่สร้างโดยผู้ใช้อื่น')
  }
  // กันลบพลาด — ต้องพิมพ์ชื่อหมู่บ้านให้ตรงก่อน
  if (confirmName !== undefined && confirmName.trim() !== village.villageName) {
    throw new Error('ชื่อหมู่บ้านที่พิมพ์ไม่ตรงกับชื่อจริง')
  }

  await prisma.village.delete({ where: { id } })

  await sendTelegram(
    `🗑 <b>ลบหมู่บ้าน</b>\n` +
    `บ้าน${village.villageName} หมู่ ${village.villageNo}\n` +
    `ต.${village.tambon} อ.${village.amphoe} จ.${village.province}\n` +
    `สมาชิกที่ถูกลบด้วย ${village._count.persons} คน\n` +
    `โดย ${session.user.firstName} ${session.user.lastName} · <code>${session.user.role}</code>`
  )

  revalidatePath('/dashboard/villages')
  revalidatePath('/dashboard')
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

export async function updateVillageTypes(
  updates: { id: number; isKpiVillage: boolean; isQualityVillage: boolean }[]
) {
  await requireAdmin()

  await prisma.$transaction(
    updates.map(({ id, isKpiVillage, isQualityVillage }) =>
      prisma.village.update({ where: { id }, data: { isKpiVillage, isQualityVillage } })
    )
  )
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/villages')
  revalidatePath('/dashboard/villages/types')
  return { updated: updates.length }
}
