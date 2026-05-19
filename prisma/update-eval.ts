import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const alcUpdates = [
  { statusY2: 'เลิกได้แล้ว',   statusY3: 'เลิกได้แล้ว',                  y2Health: true, y3Health: true },
  { statusY2: 'ลดพฤติกรรมได้', statusY3: 'ลดพฤติกรรมได้อย่างต่อเนื่อง', y2Money:  true, y3Money:  true },
  { statusY2: 'ลดพฤติกรรมได้', statusY3: 'เลิกได้แล้ว',                  y2Work:   true, y3Health: true },
  { statusY2: 'เลิกได้แล้ว',   statusY3: 'เลิกได้แล้ว',                  y2Family: true, y3Family: true },
  { statusY2: 'ออกจากโครงการ', statusY3: 'ไม่บรรลุเป้าหมาย' },
]

const tobUpdates = [
  { statusY2: 'เลิกได้แล้ว',   statusY3: 'เลิกได้แล้ว' },
  { statusY2: 'ลดพฤติกรรมได้', statusY3: 'ลดพฤติกรรมได้อย่างต่อเนื่อง' },
  { statusY2: 'เลิกได้แล้ว',   statusY3: 'เลิกได้แล้ว' },
  { statusY2: 'ลดพฤติกรรมได้', statusY3: 'ลดได้บางส่วน' },
  { statusY2: 'ออกจากโครงการ', statusY3: 'ไม่บรรลุเป้าหมาย' },
]

async function main() {
  const persons = await p.person.findMany({
    where: { villageId: 4 },
    include: { alcohol: true, tobacco: true },
  })

  let ai = 0, ti = 0
  for (const person of persons) {
    if (person.alcohol && ai < alcUpdates.length) {
      await p.personAlcohol.update({ where: { personId: person.id }, data: alcUpdates[ai++] })
    }
    if (person.tobacco && ti < tobUpdates.length) {
      await p.personTobacco.update({ where: { personId: person.id }, data: tobUpdates[ti++] })
    }
  }

  const updated = await p.person.findMany({ where: { villageId: 4 }, include: { alcohol: true, tobacco: true } })
  const alc = updated.filter((x) => x.alcohol)
  const tob = updated.filter((x) => x.tobacco)
  const alcPass = alc.filter((x) => x.alcohol?.statusY3 === 'เลิกได้แล้ว' || x.alcohol?.statusY3?.includes('ลด')).length
  const tobPass = tob.filter((x) => x.tobacco?.statusY3 === 'เลิกได้แล้ว' || x.tobacco?.statusY3?.includes('ลด')).length

  console.log('กลุ่มเหล้า', alc.length, 'คน | ผ่าน', alcPass, `(${Math.round((alcPass / alc.length) * 100)}%) KPI >=10%`, alcPass / alc.length * 100 >= 10 ? 'PASS' : 'FAIL')
  console.log('กลุ่มบุหรี่', tob.length, 'คน | ผ่าน', tobPass, `(${Math.round((tobPass / tob.length) * 100)}%) KPI >=15%`, tobPass / tob.length * 100 >= 15 ? 'PASS' : 'FAIL')
}

main().catch(console.error).finally(() => p.$disconnect())
