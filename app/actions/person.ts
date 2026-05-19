'use server'

import { prisma } from '@/app/lib/prisma'
import { requireAdmin } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'

type OutcomeFields = {
  y1Money?: boolean; y1MoneyText?: string
  y1Property?: boolean; y1PropertyText?: string
  y1Family?: boolean; y1FamilyText?: string
  y1Health?: boolean; y1HealthText?: string
  y1Work?: boolean; y1WorkText?: string
  y1Accepted?: boolean; y1AcceptedText?: string
  y1Other?: boolean; y1OtherText?: string
  y2Money?: boolean; y2MoneyText?: string
  y2Property?: boolean; y2PropertyText?: string
  y2Family?: boolean; y2FamilyText?: string
  y2Health?: boolean; y2HealthText?: string
  y2Work?: boolean; y2WorkText?: string
  y2Accepted?: boolean; y2AcceptedText?: string
  y2Other?: boolean; y2OtherText?: string
  y3Money?: boolean; y3MoneyText?: string
  y3Property?: boolean; y3PropertyText?: string
  y3Family?: boolean; y3FamilyText?: string
  y3Health?: boolean; y3HealthText?: string
  y3Work?: boolean; y3WorkText?: string
  y3Accepted?: boolean; y3AcceptedText?: string
  y3Other?: boolean; y3OtherText?: string
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
    noteY1?: string
    noteY2?: string
    noteY3?: string
  } & OutcomeFields
  tobacco?: {
    smokeType: string
    statusY1: string
    statusY2?: string
    statusY3?: string
    noteY1?: string
    noteY2?: string
    noteY3?: string
  } & OutcomeFields
  dnd?: {
    drinkType: string
    year1Result?: string
    year2Result?: string
    year3Result?: string
  }
}

export async function createPerson(input: CreatePersonInput) {
  await requireAdmin()

  const person = await prisma.person.create({
    data: {
      villageId: input.villageId,
      name: input.name,
      gender: input.gender,
      ...(input.alcohol && {
        alcohol: { create: input.alcohol },
      }),
      ...(input.tobacco && {
        tobacco: { create: input.tobacco },
      }),
      ...(input.dnd && {
        dnd: { create: input.dnd },
      }),
    },
    include: { alcohol: true, tobacco: true, dnd: true },
  })

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
    include: { alcohol: true, tobacco: true, dnd: true },
  })
}

export type UpdatePersonInput = {
  name?: string
  gender?: string
  alcohol?: ({ drinkType: string; statusY1: string; statusY2?: string; statusY3?: string; noteY1?: string; noteY2?: string; noteY3?: string } & OutcomeFields) | null
  tobacco?: ({ smokeType: string; statusY1: string; statusY2?: string; statusY3?: string; noteY1?: string; noteY2?: string; noteY3?: string } & OutcomeFields) | null
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
    } else if (input.alcohol) {
      await tx.personAlcohol.upsert({
        where: { personId: id },
        update: input.alcohol,
        create: { personId: id, ...input.alcohol },
      })
    }

    if (input.tobacco === null) {
      await tx.personTobacco.deleteMany({ where: { personId: id } })
    } else if (input.tobacco) {
      await tx.personTobacco.upsert({
        where: { personId: id },
        update: input.tobacco,
        create: { personId: id, ...input.tobacco },
      })
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
    include: {
      alcohol: true,
      tobacco: true,
      dnd: true,
    },
  })
}
