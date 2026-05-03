'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

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
  const village = await prisma.village.create({ data })
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

export async function getVillages(search?: string) {
  return prisma.village.findMany({
    where: search
      ? {
          OR: [
            { villageName: { contains: search } },
            { tambon: { contains: search } },
            { amphoe: { contains: search } },
            { province: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

