import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // Reset Y2/Y3 ทุกคนในหมู่บ้าน 4 ให้เป็น null
  await p.personAlcohol.updateMany({
    where: { person: { villageId: 4 } },
    data: { statusY2: null, statusY3: null },
  })
  await p.personOutcome.deleteMany({
    where: { person: { villageId: 4 }, group: 'alcohol', year: { in: [2, 3] } },
  })

  await p.personTobacco.updateMany({
    where: { person: { villageId: 4 } },
    data: { statusY2: null, statusY3: null },
  })
  await p.personOutcome.deleteMany({
    where: { person: { villageId: 4 }, group: 'tobacco', year: { in: [2, 3] } },
  })

  await p.personDnd.updateMany({
    where: { person: { villageId: 4 } },
    data: { year2Result: null, year3Result: null },
  })

  // สร้างสมาชิกทดสอบใหม่ที่มีครบ 3 กลุ่ม
  const existing = await p.person.findFirst({
    where: { villageId: 4, name: 'นายทดสอบ สามปัจจัย' },
  })
  if (!existing) {
    await p.person.create({
      data: {
        villageId: 4,
        name: 'นายทดสอบ สามปัจจัย',
        alcohol: { create: { drinkType: 'เสี่ยงสูง',  statusY1: 'ตั้งใจเลิก' } },
        tobacco: { create: { smokeType: 'สูบประจำ 11-20 มวน', statusY1: 'มีแนวโน้มที่จะเลิก' } },
        dnd:     { create: { drinkType: 'เคยดื่มแล้วขับ 2 ครั้งต่อเดือน', year1Result: 'เข้าร่วมโครงการ ตั้งใจเปลี่ยนพฤติกรรม' } },
      },
    })
    console.log('✅ สร้างสมาชิกทดสอบ "นายทดสอบ สามปัจจัย" แล้ว')
  }

  // แสดงสถานะหลัง reset
  const persons = await p.person.findMany({
    where: { villageId: 4 },
    include: { alcohol: true, tobacco: true, dnd: true },
    orderBy: { createdAt: 'desc' },
  })

  console.log('\n📋 สถานะหลัง reset:')
  for (const person of persons) {
    const tags = [
      person.alcohol ? `เหล้า(${person.alcohol.statusY1})` : null,
      person.tobacco ? `บุหรี่(${person.tobacco.statusY1})` : null,
      person.dnd     ? `ดื่มไม่ขับ` : null,
    ].filter(Boolean).join(' | ')
    const y2 = person.alcohol?.statusY2 ?? person.tobacco?.statusY2 ?? '-'
    const y3 = person.alcohol?.statusY3 ?? person.tobacco?.statusY3 ?? '-'
    console.log(`  ID ${person.id} ${person.name} — ${tags}`)
    console.log(`    Y2: ${y2} | Y3: ${y3}`)
  }
}

main().catch(console.error).finally(() => p.$disconnect())
