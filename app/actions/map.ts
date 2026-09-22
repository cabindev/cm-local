'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import type { VillageTypeFilter } from './dashboard'

export type ProvinceVillage = {
  id: number
  villageName: string
  villageNo: string
  tambon: string
  amphoe: string
  isKpiVillage: boolean
  isQualityVillage: boolean
  persons: number
}

export type ProvinceStat = {
  province: string
  villages: number
  persons: number
  screened: number
  kpi: number
  quality: number
  list: ProvinceVillage[]
}

// สรุปรายจังหวัดสำหรับแผนที่ — กรองตามประเภทหมู่บ้านได้
export async function getProvinceStats(type?: VillageTypeFilter): Promise<ProvinceStat[]> {
  await requireAdmin()

  const villages = await prisma.village.findMany({
    where:
      type === 'kpi'     ? { isKpiVillage: true } :
      type === 'quality' ? { isQualityVillage: true } :
      undefined,
    orderBy: [{ amphoe: 'asc' }, { tambon: 'asc' }, { villageName: 'asc' }],
    select: {
      id: true, villageName: true, villageNo: true, tambon: true, amphoe: true, province: true,
      isKpiVillage: true, isQualityVillage: true,
      _count: { select: { persons: true } },
      screeningResults: { orderBy: { year: 'desc' }, take: 1, select: { screenedCount: true } },
    },
  })

  const m = new Map<string, ProvinceStat>()
  for (const v of villages) {
    const s = m.get(v.province) ?? { province: v.province, villages: 0, persons: 0, screened: 0, kpi: 0, quality: 0, list: [] }
    s.villages++
    s.persons += v._count.persons
    s.screened += v.screeningResults[0]?.screenedCount ?? 0
    if (v.isKpiVillage) s.kpi++
    if (v.isQualityVillage) s.quality++
    s.list.push({
      id: v.id, villageName: v.villageName, villageNo: v.villageNo, tambon: v.tambon, amphoe: v.amphoe,
      isKpiVillage: v.isKpiVillage, isQualityVillage: v.isQualityVillage, persons: v._count.persons,
    })
    m.set(v.province, s)
  }
  return [...m.values()].sort((a, b) => b.villages - a.villages)
}
