'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'

export type VillageFormData = {
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
}

export async function createVillage(data: VillageFormData) {
  const session = await getServerSession(authOptions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const village = await (prisma.village.create as any)({
    data: { ...data, creatorId: session?.user?.id ?? null },
  })
  revalidatePath('/dashboard/villages')
  return { success: true, id: village.id }
}

export async function updateVillage(id: number, data: VillageFormData) {
  await prisma.village.update({ where: { id }, data })
  revalidatePath('/dashboard/villages')
  revalidatePath(`/dashboard/villages/${id}`)
  return { success: true }
}

export async function deleteVillage(id: number) {
  await prisma.village.delete({ where: { id } })
  revalidatePath('/dashboard/villages')
  return { success: true }
}

export type VillageFilters = {
  q?: string
  zone?: string
  province?: string
  amphoe?: string
  tambon?: string
}

function buildWhere(filters: VillageFilters): Prisma.VillageWhereInput {
  const { q, zone, province, amphoe, tambon } = filters
  const where: Prisma.VillageWhereInput = {}
  if (zone) where.zone = zone
  if (province) where.province = province
  if (amphoe) where.amphoe = amphoe
  if (tambon) where.tambon = tambon
  if (q) {
    where.OR = [
      { villageName: { contains: q } },
      { tambon: { contains: q } },
      { amphoe: { contains: q } },
      { province: { contains: q } },
    ]
  }
  return where
}

export async function getVillages(filters: VillageFilters = {}, page = 1, limit = 10) {
  const where = buildWhere(filters)

  const [villages, total] = await Promise.all([
    prisma.village.findMany({
      where,
      include: {
        _count: { select: { alcoholMembers: true, tobaccoMembers: true, drinkNotDriveMembers: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.village.count({ where }),
  ])

  return { villages, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
}

export async function getFilterOptions(zone?: string, province?: string, amphoe?: string) {
  const [zones, provinces, amphoes, tambons] = await Promise.all([
    prisma.village.findMany({
      select: { zone: true },
      distinct: ['zone'],
      orderBy: { zone: 'asc' },
    }),
    zone
      ? prisma.village.findMany({
          where: { zone },
          select: { province: true },
          distinct: ['province'],
          orderBy: { province: 'asc' },
        })
      : Promise.resolve([]),
    province
      ? prisma.village.findMany({
          where: { ...(zone ? { zone } : {}), province },
          select: { amphoe: true },
          distinct: ['amphoe'],
          orderBy: { amphoe: 'asc' },
        })
      : Promise.resolve([]),
    amphoe
      ? prisma.village.findMany({
          where: { ...(zone ? { zone } : {}), ...(province ? { province } : {}), amphoe },
          select: { tambon: true },
          distinct: ['tambon'],
          orderBy: { tambon: 'asc' },
        })
      : Promise.resolve([]),
  ])

  return {
    zones: zones.map(z => z.zone),
    provinces: (provinces as { province: string }[]).map(p => p.province),
    amphoes: (amphoes as { amphoe: string }[]).map(a => a.amphoe),
    tambons: (tambons as { tambon: string }[]).map(t => t.tambon),
  }
}
