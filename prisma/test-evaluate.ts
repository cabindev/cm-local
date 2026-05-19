import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const personId = 17
  const villageId = 4

  console.log('--- ก่อนประเมิน ---')
  const before = await p.person.findUnique({
    where: { id: personId },
    include: { alcohol: true, tobacco: true, dnd: true },
  })
  console.log('ชื่อ:', before?.name)
  console.log('เหล้า Y1/Y2/Y3:', before?.alcohol?.statusY1, '/', before?.alcohol?.statusY2 ?? 'ยังไม่ระบุ', '/', before?.alcohol?.statusY3 ?? 'ยังไม่ระบุ')
  console.log('บุหรี่ Y1/Y2/Y3:', before?.tobacco?.statusY1, '/', before?.tobacco?.statusY2 ?? 'ยังไม่ระบุ', '/', before?.tobacco?.statusY3 ?? 'ยังไม่ระบุ')

  // จำลองการกรอกฟอร์มประเมินปีที่ 2 และ 3
  console.log('\n--- กำลังประเมิน (เหมือนกรอกฟอร์ม edit) ---')
  console.log('เหล้า Y2 → ลดพฤติกรรมได้')
  console.log('เหล้า Y3 → เลิกได้แล้ว')
  console.log('บุหรี่ Y2 → ลดพฤติกรรมได้')
  console.log('บุหรี่ Y3 → ลดพฤติกรรมได้อย่างต่อเนื่อง')

  await p.personAlcohol.update({
    where: { personId },
    data: {
      statusY2: 'ลดพฤติกรรมได้',
      statusY3: 'เลิกได้แล้ว',
      y2Health: true, y2HealthText: 'ร่างกายแข็งแรงขึ้น ไม่ป่วยบ่อย',
      y3Health: true, y3HealthText: 'หยุดดื่มได้สำเร็จ สุขภาพดีขึ้นมาก',
      y3Money: true,  y3MoneyText: 'ประหยัดเงินได้มากกว่า 3,000 บาท/เดือน',
    },
  })

  await p.personTobacco.update({
    where: { personId },
    data: {
      statusY2: 'ลดพฤติกรรมได้',
      statusY3: 'ลดพฤติกรรมได้อย่างต่อเนื่อง',
      y2Health: true,
      y3Health: true, y3HealthText: 'ลดสูบเหลือ 3 มวน/วัน',
    },
  })

  console.log('\n--- หลังประเมิน ---')
  const after = await p.person.findUnique({
    where: { id: personId },
    include: { alcohol: true, tobacco: true },
  })
  console.log('เหล้า Y1/Y2/Y3:', after?.alcohol?.statusY1, '/', after?.alcohol?.statusY2, '/', after?.alcohol?.statusY3)
  console.log('บุหรี่ Y1/Y2/Y3:', after?.tobacco?.statusY1, '/', after?.tobacco?.statusY2, '/', after?.tobacco?.statusY3)
  console.log('y3MoneyText:', after?.alcohol?.y3MoneyText)

  // สรุปภาพรวมหมู่บ้าน
  const allPersons = await p.person.findMany({
    where: { villageId },
    include: { alcohol: true, tobacco: true },
  })
  const alc = allPersons.filter((x) => x.alcohol)
  const tob = allPersons.filter((x) => x.tobacco)
  const alcAssessed = alc.filter((x) => x.alcohol?.statusY3).length
  const tobAssessed = tob.filter((x) => x.tobacco?.statusY3).length
  const alcPass = alc.filter((x) => ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดพฤติกรรมได้'].includes(x.alcohol?.statusY3 ?? '')).length
  const tobPass = tob.filter((x) => ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดพฤติกรรมได้'].includes(x.tobacco?.statusY3 ?? '')).length

  console.log('\n--- สรุปภาพรวมหมู่บ้าน ---')
  console.log(`กลุ่มเหล้า: ประเมินแล้ว ${alcAssessed}/${alc.length} | ผ่าน ${alcPass} คน (${Math.round(alcPass/alc.length*100)}%)`)
  console.log(`กลุ่มบุหรี่: ประเมินแล้ว ${tobAssessed}/${tob.length} | ผ่าน ${tobPass} คน (${Math.round(tobPass/tob.length*100)}%)`)
  if (alcAssessed === alc.length) console.log('KPI เหล้า:', alcPass/alc.length*100 >= 10 ? 'PASS (>=10%)' : 'FAIL')
  if (tobAssessed === tob.length) console.log('KPI บุหรี่:', tobPass/tob.length*100 >= 15 ? 'PASS (>=15%)' : 'FAIL')
}

main().catch(console.error).finally(() => p.$disconnect())
