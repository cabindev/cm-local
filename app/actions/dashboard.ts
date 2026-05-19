'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'

const ORG_KEYS = ['school', 'temple', 'localAdmin', 'villageAdmin', 'hospital', 'orgGroup'] as const

export async function getDashboardStats() {
  await requireAdmin()

  const villages = await prisma.village.findMany({
    include: {
      screeningResults: true,
      envItems: true,
      communityOrgs: true,
      _count: { select: { persons: true } },
    },
  })

  const persons = await prisma.person.findMany({
    select: {
      id: true, villageId: true,
      alcohol: { select: { statusY1: true, statusY2: true, statusY3: true, noteY1: true, noteY2: true, noteY3: true } },
      tobacco: { select: { statusY1: true, statusY2: true, statusY3: true } },
      dnd:     { select: { year1Result: true, year2Result: true, year3Result: true } },
    },
  })

  // villageId → zone lookup
  const villageZone = new Map(villages.map(v => [v.id, v.zone]))

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const villageCount  = villages.length
  const personCount   = persons.length
  const populationTotal = villages.reduce((s, v) => s + v.actualPopulation, 0)
  const screenedTotal   = villages.reduce((s, v) => s + (v.screeningResults[0]?.screenedCount ?? 0), 0)
  const coveragePct     = populationTotal > 0 ? Math.round((screenedTotal / populationTotal) * 100) : 0

  // ── Screening aggregate ──────────────────────────────────────────────────────
  const alc = { riskLow: 0, risk: 0, danger: 0, addicted: 0, none: 0 }
  const tob = { count: 0, none: 0 }
  const dnd = { drinkDrive: 0, drinkNoDrive: 0, none: 0 }
  let screeningVillages = 0

  for (const v of villages) {
    const s = v.screeningResults[0]
    if (!s || s.screenedCount === 0) continue
    screeningVillages++
    alc.riskLow   += s.alcoholRiskLow
    alc.risk      += s.alcoholRisk
    alc.danger    += s.alcoholDanger
    alc.addicted  += s.alcoholAddicted
    alc.none      += Math.max(0, s.alcoholNone)
    tob.count     += s.tobaccoCount
    tob.none      += Math.max(0, s.tobaccoNone)
    dnd.drinkDrive   += s.drinkAndDrive
    dnd.drinkNoDrive += s.drinkNotDriveN
    dnd.none         += Math.max(0, s.screenedCount - s.drinkAndDrive - s.drinkNotDriveN)
  }

  // ── By zone ─────────────────────────────────────────────────────────────────
  const zoneMap = new Map<string, { villages: number; persons: number; screened: number; population: number; alcohol: number; tobacco: number; dnd: number }>()
  for (const v of villages) {
    const z = v.zone || 'ไม่ระบุ'
    if (!zoneMap.has(z)) zoneMap.set(z, { villages: 0, persons: 0, screened: 0, population: 0, alcohol: 0, tobacco: 0, dnd: 0 })
    const row = zoneMap.get(z)!
    row.villages++
    row.persons    += v._count.persons
    row.screened   += v.screeningResults[0]?.screenedCount ?? 0
    row.population += v.actualPopulation
  }
  // count persons with each risk type per zone
  for (const p of persons) {
    const z = villageZone.get(p.villageId) || 'ไม่ระบุ'
    const row = zoneMap.get(z)
    if (!row) continue
    if (p.alcohol) row.alcohol++
    if (p.tobacco) row.tobacco++
    if (p.dnd)     row.dnd++
  }
  const byZone = [...zoneMap.entries()].map(([zone, d]) => ({ zone, ...d }))
    .sort((a, b) => b.villages - a.villages)

  // ── Env summary ─────────────────────────────────────────────────────────────
  const env = {
    funeralCount: 0, funeralPolicy: 0, funeralCommunityRule: 0,
    traditionCount: 0, shopCount: 0, noAlcoholShop: 0, shopLegalCount: 0, nodrinkzoneCount: 0,
  }
  for (const v of villages) {
    const em = Object.fromEntries(v.envItems.map(e => [e.itemType, e]))
    if (em.funeral?.hasItem)          env.funeralCount++
    if (em.funeral?.hasPolicy)        env.funeralPolicy++
    if (em.funeral?.hasCommunityRule) env.funeralCommunityRule++
    if (em.tradition?.hasItem)        env.traditionCount++
    if (em.shop?.hasItem)             env.shopCount++
    if (em.shop?.noAlcohol)           env.noAlcoholShop++
    if (em.shop?.hasShopLegal)        env.shopLegalCount++
    if (em.nodrinkzone?.hasItem)      env.nodrinkzoneCount++
  }

  // ── Org participation ────────────────────────────────────────────────────────
  const orgParticipation: Record<string, number> = {}
  for (const key of ORG_KEYS) orgParticipation[key] = 0
  for (const v of villages) {
    for (const o of v.communityOrgs) {
      if (o.hasParticipation && o.orgType in orgParticipation) orgParticipation[o.orgType]++
    }
  }

  // ── Person outcomes ──────────────────────────────────────────────────────────
  const SUCCESS_TERMS = ['เลิก', 'หยุด', 'งด']
  function isSuccess(s: string | null | undefined) {
    return !!s && SUCCESS_TERMS.some(t => s.includes(t))
  }

  let alcTotal = 0, alcY1 = 0, alcY2 = 0, alcY3 = 0, alcSuccess = 0
  let tobTotal = 0, tobY1 = 0, tobY2 = 0, tobY3 = 0, tobSuccess = 0
  let dndTotal = 0, dndY1 = 0, dndY2 = 0, dndY3 = 0, dndSuccess = 0

  for (const p of persons) {
    if (p.alcohol) {
      alcTotal++
      if (p.alcohol.statusY1) { alcY1++; if (isSuccess(p.alcohol.statusY1)) alcSuccess++ }
      if (p.alcohol.statusY2) alcY2++
      if (p.alcohol.statusY3) alcY3++
    }
    if (p.tobacco) {
      tobTotal++
      if (p.tobacco.statusY1) { tobY1++; if (isSuccess(p.tobacco.statusY1)) tobSuccess++ }
      if (p.tobacco.statusY2) tobY2++
      if (p.tobacco.statusY3) tobY3++
    }
    if (p.dnd) {
      dndTotal++
      if (p.dnd.year1Result) dndY1++
      if (p.dnd.year2Result) dndY2++
      if (p.dnd.year3Result) { dndY3++; if (p.dnd.year3Result === 'บรรลุเป้าหมายอย่างต่อเนื่อง') dndSuccess++ }
    }
  }

  return {
    villageCount, personCount, populationTotal, screenedTotal, coveragePct, screeningVillages,
    alc, tob, dnd,
    byZone,
    env,
    orgParticipation,
    outcomes: { alcTotal, alcY1, alcY2, alcY3, alcSuccess, tobTotal, tobY1, tobY2, tobY3, tobSuccess, dndTotal, dndY1, dndY2, dndY3, dndSuccess },
  }
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>
