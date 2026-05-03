'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

// ---- Screening ----
export async function upsertScreening(villageId: number, year: number, data: {
  screenedCount: number
  alcoholRiskLow: number
  alcoholRisk: number
  alcoholDanger: number
  alcoholAddicted: number
  alcoholNone: number
  tobaccoCount: number
  tobaccoNone: number
  drinkAndDrive: number
  drinkNotDriveN: number
}) {
  await prisma.screeningResult.upsert({
    where: { villageId_year: { villageId, year } },
    create: { villageId, year, ...data },
    update: data,
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}

// ---- Env Item (cross-year, per type) ----
export async function upsertEnvItem(villageId: number, itemType: string, data: {
  hasItem: boolean
  itemCount: number
  result1?: string
  result2?: string
  result3?: string
}) {
  await prisma.envItem.upsert({
    where: { villageId_itemType: { villageId, itemType } },
    create: { villageId, itemType, ...data },
    update: data,
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}

// ---- Community Background ----
export async function upsertCommunityBackground(villageId: number, itemType: string, data: {
  hasItem: boolean
  fileUrl?: string
  fileName?: string
}) {
  await prisma.communityBackground.upsert({
    where: { villageId_itemType: { villageId, itemType } },
    create: { villageId, itemType, ...data },
    update: data,
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}

// ---- Alcohol Member (individual records) ----
type AlcoholMemberData = {
  name: string
  drinkType: string
  y1Money: boolean; y1MoneyText?: string
  y1Property: boolean; y1PropertyText?: string
  y1Family: boolean; y1FamilyText?: string
  y1Health: boolean; y1HealthText?: string
  y1Work: boolean; y1WorkText?: string
  y1Accepted: boolean; y1AcceptedText?: string
  y1Other: boolean; y1OtherText?: string
  y2Money: boolean; y2MoneyText?: string
  y2Property: boolean; y2PropertyText?: string
  y2Family: boolean; y2FamilyText?: string
  y2Health: boolean; y2HealthText?: string
  y2Work: boolean; y2WorkText?: string
  y2Accepted: boolean; y2AcceptedText?: string
  y2Other: boolean; y2OtherText?: string
  y3Money: boolean; y3MoneyText?: string
  y3Property: boolean; y3PropertyText?: string
  y3Family: boolean; y3FamilyText?: string
  y3Health: boolean; y3HealthText?: string
  y3Work: boolean; y3WorkText?: string
  y3Accepted: boolean; y3AcceptedText?: string
  y3Other: boolean; y3OtherText?: string
}

export async function saveAlcoholMembers(villageId: number, members: (AlcoholMemberData & { id?: number })[]) {
  const existingIds = members.filter((m) => m.id).map((m) => m.id!)

  await prisma.$transaction([
    prisma.alcoholMember.deleteMany({
      where: { villageId, id: { notIn: existingIds } },
    }),
    ...members.map((m) => {
      const { id, ...data } = m
      return id
        ? prisma.alcoholMember.update({ where: { id }, data })
        : prisma.alcoholMember.create({ data: { villageId, ...data } })
    }),
  ])

  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}

// ---- Tobacco Member (individual records) ----
type TobaccoMemberData = {
  name: string
  smokeType: string
  y1Money: boolean; y1MoneyText?: string
  y1Property: boolean; y1PropertyText?: string
  y1Family: boolean; y1FamilyText?: string
  y1Health: boolean; y1HealthText?: string
  y1Work: boolean; y1WorkText?: string
  y1Accepted: boolean; y1AcceptedText?: string
  y1Other: boolean; y1OtherText?: string
  y2Money: boolean; y2MoneyText?: string
  y2Property: boolean; y2PropertyText?: string
  y2Family: boolean; y2FamilyText?: string
  y2Health: boolean; y2HealthText?: string
  y2Work: boolean; y2WorkText?: string
  y2Accepted: boolean; y2AcceptedText?: string
  y2Other: boolean; y2OtherText?: string
  y3Money: boolean; y3MoneyText?: string
  y3Property: boolean; y3PropertyText?: string
  y3Family: boolean; y3FamilyText?: string
  y3Health: boolean; y3HealthText?: string
  y3Work: boolean; y3WorkText?: string
  y3Accepted: boolean; y3AcceptedText?: string
  y3Other: boolean; y3OtherText?: string
}

export async function saveTobaccoMembers(villageId: number, members: (TobaccoMemberData & { id?: number })[]) {
  const existingIds = members.filter((m) => m.id).map((m) => m.id!)

  await prisma.$transaction([
    prisma.tobaccoMember.deleteMany({
      where: { villageId, id: { notIn: existingIds } },
    }),
    ...members.map((m) => {
      const { id, ...data } = m
      return id
        ? prisma.tobaccoMember.update({ where: { id }, data })
        : prisma.tobaccoMember.create({ data: { villageId, ...data } })
    }),
  ])

  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}

// ---- Drink Not Drive Member ----
export async function saveDrinkNotDriveMembers(
  villageId: number,
  members: { id?: number; name: string; drinkType: string; year1Result?: string; year2Result?: string; year3Result?: string }[]
) {
  const existingIds = members.filter((m) => m.id).map((m) => m.id!)
  await prisma.$transaction([
    prisma.drinkNotDriveMember.deleteMany({
      where: { villageId, id: { notIn: existingIds } },
    }),
    ...members.map((m) => {
      const { id, ...data } = m
      return id
        ? prisma.drinkNotDriveMember.update({ where: { id }, data })
        : prisma.drinkNotDriveMember.create({ data: { villageId, ...data } })
    }),
  ])
  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}

// ---- Community Org (cross-year, per org) ----
export async function upsertCommunityOrg(villageId: number, orgType: string, data: {
  hasParticipation: boolean
  result1?: string
  result2?: string
  result3?: string
}) {
  await prisma.communityOrg.upsert({
    where: { villageId_orgType: { villageId, orgType } },
    create: { villageId, orgType, ...data },
    update: data,
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
  return { success: true }
}
