'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'

export async function upsertCommunityBackground(
  villageId: number,
  itemType: string,
  hasItem: boolean,
  fileUrl?: string | null,
  fileName?: string | null,
) {
  await requireAdmin()

  await prisma.communityBackground.upsert({
    where: { villageId_itemType: { villageId, itemType } },
    update: { hasItem, ...(fileUrl !== undefined && { fileUrl, fileName }) },
    create: { villageId, itemType, hasItem, fileUrl: fileUrl ?? null, fileName: fileName ?? null },
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
}

export async function upsertEnvItem(
  villageId: number,
  itemType: string,
  data: {
    hasItem: boolean
    hasPolicy?: boolean | null
    policyFileUrl?: string | null
    policyFileName?: string | null
    hasCommunityRule?: boolean | null
    communityRuleFileUrl?: string | null
    communityRuleFileName?: string | null
    hasTraditionEvent?: boolean | null
    traditionEventNames?: string[]
    hasNoDrinkSite?: boolean | null
    noDrinkSiteNames?: string[]
    noAlcohol?: boolean | null
    shopNames?: string[]
    hasShopLegal?: boolean | null
    shopLegalNames?: string[]
  },
) {
  await requireAdmin()

  const mainFields = {
    hasItem: data.hasItem,
    hasPolicy: data.hasPolicy ?? null,
    hasCommunityRule: data.hasCommunityRule ?? null,
    hasTraditionEvent: data.hasTraditionEvent ?? null,
    traditionEventNames: data.traditionEventNames ? JSON.stringify(data.traditionEventNames.filter(Boolean)) : null,
    hasNoDrinkSite: data.hasNoDrinkSite ?? null,
    noDrinkSiteNames: data.noDrinkSiteNames ? JSON.stringify(data.noDrinkSiteNames.filter(Boolean)) : null,
    noAlcohol: data.noAlcohol ?? null,
    shopNames: data.shopNames ? JSON.stringify(data.shopNames.filter(Boolean)) : null,
    hasShopLegal: data.hasShopLegal ?? null,
    shopLegalNames: data.shopLegalNames ? JSON.stringify(data.shopLegalNames.filter(Boolean)) : null,
  }

  // File fields are only updated when explicitly provided (undefined = skip, don't overwrite)
  const fileFields = {
    ...(data.policyFileUrl !== undefined && {
      policyFileUrl: data.policyFileUrl,
      policyFileName: data.policyFileName ?? null,
    }),
    ...(data.communityRuleFileUrl !== undefined && {
      communityRuleFileUrl: data.communityRuleFileUrl,
      communityRuleFileName: data.communityRuleFileName ?? null,
    }),
  }

  await prisma.envItem.upsert({
    where: { villageId_itemType: { villageId, itemType } },
    update: { ...mainFields, ...fileFields },
    create: {
      villageId,
      itemType,
      ...mainFields,
      policyFileUrl: null,
      policyFileName: null,
      communityRuleFileUrl: null,
      communityRuleFileName: null,
    },
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
}

export async function upsertCommunityOrg(
  villageId: number,
  orgType: string,
  data: {
    hasParticipation: boolean
    orgNames?: string[]
  },
) {
  await requireAdmin()

  const payload = {
    hasParticipation: data.hasParticipation,
    orgNames: data.orgNames ? JSON.stringify(data.orgNames.filter(Boolean)) : null,
  }

  await prisma.communityOrg.upsert({
    where: { villageId_orgType: { villageId, orgType } },
    update: payload,
    create: { villageId, orgType, ...payload },
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
}

export async function upsertScreeningResult(
  villageId: number,
  data: {
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
  },
) {
  await requireAdmin()

  await prisma.screeningResult.upsert({
    where: { villageId_year: { villageId, year: 1 } },
    update: data,
    create: { villageId, year: 1, ...data },
  })
  revalidatePath(`/dashboard/villages/${villageId}`)
}
