'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'

const OUTCOME_TYPES = ['Money', 'Property', 'Family', 'Health', 'Work', 'Accepted', 'Other'] as const
type OutcomeRecord = Record<string, boolean | string>

function outcomesToDb(personId: number, group: string, rec: OutcomeRecord) {
  const rows: { personId: number; group: string; year: number; outcomeType: string; hasIt: boolean; detail: string | null; moneyNote: string | null }[] = []
  for (const year of [1, 2, 3]) {
    for (const type of OUTCOME_TYPES) {
      const hasIt = !!rec[`y${year}${type}`]
      const detail = (rec[`y${year}${type}Text`] as string) || null
      const moneyNote = type === 'Money' ? ((rec[`y${year}${type}Note`] as string) || null) : null
      if (hasIt || detail) rows.push({ personId, group, year, outcomeType: type, hasIt, detail, moneyNote })
    }
  }
  return rows
}

export type CreatePersonInput = {
  villageId: number
  name: string
  gender: string
  alcohol?: {
    drinkType: string
    statusY1: string
    statusY2?: string
    statusY3?: string
    outcomes?: OutcomeRecord
  }
  tobacco?: {
    smokeType: string
    statusY1: string
    statusY2?: string
    statusY3?: string
    noteY1?: string
    outcomes?: OutcomeRecord
  }
  dnd?: {
    drinkType: string
    year1Result?: string
    year2Result?: string
    year3Result?: string
  }
}

export async function createPerson(input: CreatePersonInput) {
  await requireAdmin()

  const { alcohol, tobacco, dnd } = input
  const alcOutcomes = alcohol?.outcomes ?? {}
  const tobOutcomes = tobacco?.outcomes ?? {}
  const { outcomes: _a, ...alcBase } = alcohol ?? { outcomes: undefined }
  const { outcomes: _t, ...tobBase } = tobacco ?? { outcomes: undefined }

  const person = await prisma.person.create({
    data: {
      villageId: input.villageId,
      name: input.name,
      gender: input.gender,
      ...(alcohol && { alcohol: { create: alcBase } }),
      ...(tobacco && { tobacco: { create: tobBase } }),
      ...(dnd && { dnd: { create: dnd } }),
    },
    select: { id: true },
  })

  const outcomeRows = [
    ...outcomesToDb(person.id, 'alcohol', alcOutcomes),
    ...outcomesToDb(person.id, 'tobacco', tobOutcomes),
  ]
  if (outcomeRows.length > 0) {
    await prisma.personOutcome.createMany({ data: outcomeRows })
  }

  revalidatePath(`/dashboard/villages/${input.villageId}`)
  return person
}

export async function deletePerson(id: number, villageId: number) {
  await requireAdmin()
  await prisma.person.delete({ where: { id } })
  revalidatePath(`/dashboard/villages/${villageId}`)
}

export async function getPerson(id: number) {
  return prisma.person.findUnique({
    where: { id },
    include: { alcohol: true, tobacco: true, dnd: true, outcomes: true },
  })
}

export type UpdatePersonInput = {
  name?: string
  gender?: string
  alcohol?: {
    drinkType: string
    statusY1: string
    statusY2?: string
    statusY3?: string
    outcomes?: OutcomeRecord
  } | null
  tobacco?: {
    smokeType: string
    statusY1: string
    statusY2?: string
    statusY3?: string
    noteY1?: string
    outcomes?: OutcomeRecord
  } | null
  dnd?: { drinkType: string; year1Result?: string; year2Result?: string; year3Result?: string } | null
}

export async function updatePerson(id: number, villageId: number, input: UpdatePersonInput) {
  await requireAdmin()

  await prisma.$transaction(async (tx) => {
    if (input.name !== undefined || input.gender !== undefined) {
      await tx.person.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.gender !== undefined && { gender: input.gender }),
        },
      })
    }

    if (input.alcohol === null) {
      await tx.personAlcohol.deleteMany({ where: { personId: id } })
      await tx.personOutcome.deleteMany({ where: { personId: id, group: 'alcohol' } })
    } else if (input.alcohol) {
      const { outcomes: alcOutcomes, ...alcBase } = input.alcohol
      await tx.personAlcohol.upsert({
        where: { personId: id },
        update: alcBase,
        create: { personId: id, ...alcBase },
      })
      await tx.personOutcome.deleteMany({ where: { personId: id, group: 'alcohol' } })
      const rows = outcomesToDb(id, 'alcohol', alcOutcomes ?? {})
      if (rows.length > 0) await tx.personOutcome.createMany({ data: rows })
    }

    if (input.tobacco === null) {
      await tx.personTobacco.deleteMany({ where: { personId: id } })
      await tx.personOutcome.deleteMany({ where: { personId: id, group: 'tobacco' } })
    } else if (input.tobacco) {
      const { outcomes: tobOutcomes, ...tobBase } = input.tobacco
      await tx.personTobacco.upsert({
        where: { personId: id },
        update: tobBase,
        create: { personId: id, ...tobBase },
      })
      await tx.personOutcome.deleteMany({ where: { personId: id, group: 'tobacco' } })
      const rows = outcomesToDb(id, 'tobacco', tobOutcomes ?? {})
      if (rows.length > 0) await tx.personOutcome.createMany({ data: rows })
    }

    if (input.dnd === null) {
      await tx.personDnd.deleteMany({ where: { personId: id } })
    } else if (input.dnd) {
      await tx.personDnd.upsert({
        where: { personId: id },
        update: input.dnd,
        create: { personId: id, ...input.dnd },
      })
    }
  })

  revalidatePath(`/dashboard/villages/${villageId}`)
}

export async function getPersonsByVillage(villageId: number) {
  return prisma.person.findMany({
    where: { villageId },
    orderBy: { createdAt: 'desc' },
    include: { alcohol: true, tobacco: true, dnd: true, outcomes: true },
  })
}
