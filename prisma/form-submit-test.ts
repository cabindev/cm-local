import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

// จำลองการกรอกฟอร์ม /dashboard/villages/4/persons/20/edit
// นายทดสอบ สามปัจจัย — ครบ 3 กลุ่ม 3 ปี

async function main() {
  const personId = 20
  const villageId = 4

  console.log('=== จำลองการกรอกฟอร์ม /persons/20/edit ===\n')

  // ─── ตรวจสอบข้อมูลก่อนกรอก ───
  const before = await p.person.findUnique({
    where: { id: personId },
    include: { alcohol: true, tobacco: true, dnd: true },
  })
  console.log('ชื่อ:', before?.name)
  console.log('ก่อนกรอก:')
  console.log('  เหล้า  Y1:', before?.alcohol?.statusY1, '| Y2:', before?.alcohol?.statusY2 ?? '-', '| Y3:', before?.alcohol?.statusY3 ?? '-')
  console.log('  บุหรี่ Y1:', before?.tobacco?.statusY1, '| Y2:', before?.tobacco?.statusY2 ?? '-', '| Y3:', before?.tobacco?.statusY3 ?? '-')
  console.log('  ดื่มไม่ขับ Y1:', before?.dnd?.year1Result ?? '-', '| Y2:', before?.dnd?.year2Result ?? '-', '| Y3:', before?.dnd?.year3Result ?? '-')

  console.log('\n--- กรอกฟอร์ม (เหมือนผู้ใช้เลือกค่าจาก dropdown และติ๊ก checkbox) ---')

  // ─── UPDATE PERSON (เหมือน form submit) ───
  await p.$transaction(async (tx) => {

    // ── เหล้า ──
    console.log('\n[เหล้า]')
    console.log('  ✅ ติ๊ก "บุคคลนี้ดื่มเครื่องดื่มแอลกอฮอล์"')
    console.log('  ประเภทการดื่ม: เสี่ยงสูง')
    console.log('  ปีที่ 1: ตั้งใจเลิก')
    console.log('  ปีที่ 2: ลดพฤติกรรมได้')
    console.log('  ปีที่ 3: เลิกได้แล้ว')
    console.log('  ผลลัพธ์: ✅ สุขภาพ (ปี1,2,3) ✅ เงิน (ปี2,3) ✅ ครอบครัว (ปี3)')

    await tx.personAlcohol.update({
      where: { personId },
      data: {
        drinkType: 'เสี่ยงสูง',
        statusY1:  'ตั้งใจเลิก',
        statusY2:  'ลดพฤติกรรมได้',
        statusY3:  'เลิกได้แล้ว',
        y1Health: true,  y1HealthText: 'เริ่มรู้สึกร่างกายดีขึ้น ไม่ปวดหัว',
        y2Health: true,  y2HealthText: 'สุขภาพดีขึ้นชัดเจน นอนหลับได้',
        y2Money:  true,  y2MoneyText:  'ประหยัดได้ประมาณ 1,500 บาท/เดือน',
        y3Health: true,  y3HealthText: 'หยุดดื่มได้สำเร็จ ผลเลือดปกติ',
        y3Money:  true,  y3MoneyText:  'ประหยัดได้มากกว่า 3,000 บาท/เดือน',
        y3Family: true,  y3FamilyText: 'ครอบครัวมีความสุข ความสัมพันธ์ดีขึ้น',
      },
    })

    // ── บุหรี่ ──
    console.log('\n[บุหรี่]')
    console.log('  ✅ ติ๊ก "บุคคลนี้สูบบุหรี่หรือยาสูบ"')
    console.log('  ประเภท: สูบประจำ 11-20 มวน')
    console.log('  ปีที่ 1: มีแนวโน้มที่จะเลิก')
    console.log('  ปีที่ 2: ลดพฤติกรรมได้')
    console.log('  ปีที่ 3: ลดพฤติกรรมได้อย่างต่อเนื่อง')
    console.log('  ผลลัพธ์: ✅ สุขภาพ (ปี1,2,3) ✅ เงิน (ปี2)')

    await tx.personTobacco.update({
      where: { personId },
      data: {
        smokeType: 'สูบประจำ 11-20 มวน',
        statusY1:  'มีแนวโน้มที่จะเลิก',
        statusY2:  'ลดพฤติกรรมได้',
        statusY3:  'ลดพฤติกรรมได้อย่างต่อเนื่อง',
        y1Health: true,  y1HealthText: 'รู้สึกหายใจสะดวกขึ้น',
        y2Health: true,  y2HealthText: 'ลดเหลือ 5 มวน/วัน ปอดดีขึ้น',
        y2Money:  true,  y2MoneyText:  'ประหยัดค่าบุหรี่ได้ 800 บาท/เดือน',
        y3Health: true,  y3HealthText: 'ลดเหลือ 3 มวน/วัน ยังลดต่อเนื่อง',
      },
    })

    // ── ดื่มไม่ขับ ──
    console.log('\n[ดื่มไม่ขับ]')
    console.log('  ✅ ติ๊ก "บุคคลนี้เข้าร่วมโครงการดื่มไม่ขับ"')
    console.log('  ประเภท: เคยดื่มแล้วขับ 2 ครั้งต่อเดือน')
    console.log('  ปีที่ 1: เข้าร่วมกิจกรรมชุมชน ตั้งใจเปลี่ยน')
    console.log('  ปีที่ 2: ไม่มีรายงานดื่มแล้วขับตลอด 8 เดือน')
    console.log('  ปีที่ 3: ไม่ดื่มก่อนขับตลอด 3 ปี บรรลุเป้าหมาย')

    await tx.personDnd.update({
      where: { personId },
      data: {
        drinkType:   'เคยดื่มแล้วขับ 2 ครั้งต่อเดือน',
        year1Result: 'เข้าร่วมกิจกรรมชุมชน ตั้งใจเปลี่ยนพฤติกรรม ใช้บริการรถรับส่งแทน',
        year2Result: 'ไม่มีรายงานการดื่มแล้วขับตลอด 8 เดือน ผ่านการทดสอบจากด่านตรวจ',
        year3Result: 'ไม่ดื่มก่อนขับได้ตลอด 3 ปี บรรลุเป้าหมายโครงการ',
      },
    })
  })

  // ─── ตรวจสอบหลังกรอก ───
  const after = await p.person.findUnique({
    where: { id: personId },
    include: { alcohol: true, tobacco: true, dnd: true },
  })

  console.log('\n=== ผลหลังบันทึก ===')
  console.log('[เหล้า]')
  console.log('  Y1:', after?.alcohol?.statusY1)
  console.log('  Y2:', after?.alcohol?.statusY2)
  console.log('  Y3:', after?.alcohol?.statusY3)
  console.log('  y3Health:', after?.alcohol?.y3HealthText)
  console.log('  y3Family:', after?.alcohol?.y3FamilyText)

  console.log('[บุหรี่]')
  console.log('  Y1:', after?.tobacco?.statusY1)
  console.log('  Y2:', after?.tobacco?.statusY2)
  console.log('  Y3:', after?.tobacco?.statusY3)

  console.log('[ดื่มไม่ขับ]')
  console.log('  Y1:', after?.dnd?.year1Result)
  console.log('  Y2:', after?.dnd?.year2Result)
  console.log('  Y3:', after?.dnd?.year3Result)

  // ─── สรุปภาพรวม KPI ───
  console.log('\n=== สรุป KPI หมู่บ้าน 4 ===')
  const all = await p.person.findMany({
    where: { villageId },
    include: { alcohol: true, tobacco: true, dnd: true },
  })

  const alc = all.filter((x) => x.alcohol)
  const tob = all.filter((x) => x.tobacco)
  const dnd = all.filter((x) => x.dnd)

  const alcAssessed = alc.filter((x) => x.alcohol?.statusY3).length
  const tobAssessed = tob.filter((x) => x.tobacco?.statusY3).length
  const dndAssessed = dnd.filter((x) => x.dnd?.year3Result).length

  const alcPass = alc.filter((x) => ['เลิกได้แล้ว','ลดพฤติกรรมได้อย่างต่อเนื่อง','ลดพฤติกรรมได้'].includes(x.alcohol?.statusY3 ?? '')).length
  const tobPass = tob.filter((x) => ['เลิกได้แล้ว','ลดพฤติกรรมได้อย่างต่อเนื่อง','ลดพฤติกรรมได้'].includes(x.tobacco?.statusY3 ?? '')).length

  console.log(`เหล้า:    ประเมินแล้ว ${alcAssessed}/${alc.length} — ผ่าน ${alcPass} คน ${alcAssessed === alc.length ? (alcPass/alc.length*100 >= 10 ? '✅ KPI PASS' : '❌ KPI FAIL') : '⏳ รอประเมินครบ'}`)
  console.log(`บุหรี่:   ประเมินแล้ว ${tobAssessed}/${tob.length} — ผ่าน ${tobPass} คน ${tobAssessed === tob.length ? (tobPass/tob.length*100 >= 15 ? '✅ KPI PASS' : '❌ KPI FAIL') : '⏳ รอประเมินครบ'}`)
  console.log(`ดื่มไม่ขับ: ประเมินแล้ว ${dndAssessed}/${dnd.length} — ยังไม่ครบ`)
}

main().catch(console.error).finally(() => p.$disconnect())
