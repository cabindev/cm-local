import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TYPES = ['Money', 'Property', 'Family', 'Health', 'Work', 'Accepted', 'Other'] as const
type OType = typeof TYPES[number]

async function migrateGroup(group: 'alcohol' | 'tobacco') {
  const records = group === 'alcohol'
    ? await (prisma as any).personAlcohol.findMany()
    : await (prisma as any).personTobacco.findMany()

  let count = 0
  for (const rec of records) {
    for (const year of [1, 2, 3] as const) {
      for (const type of TYPES) {
        const hasIt: boolean = !!(rec as any)[`y${year}${type}`]
        const detail: string | null = ((rec as any)[`y${year}${type}Text`] as string) || null
        const moneyNote: string | null =
          type === 'Money' ? (((rec as any)[`y${year}MoneyNote`] as string) || null) : null

        if (hasIt || detail) {
          await prisma.personOutcome.upsert({
            where: { personId_group_year_outcomeType: { personId: rec.personId, group, year, outcomeType: type } },
            update: { hasIt, detail, moneyNote },
            create: { personId: rec.personId, group, year, outcomeType: type, hasIt, detail, moneyNote },
          })
          count++
        }
      }
    }
  }
  console.log(`${group}: migrated ${records.length} records → ${count} outcome rows`)
}

async function main() {
  await migrateGroup('alcohol')
  await migrateGroup('tobacco')
  console.log('Migration complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
