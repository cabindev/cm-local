import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

// สถานการณ์จริงที่หลากหลาย — สะท้อนผลลัพธ์ที่เป็นไปได้ในโครงการจริง
const alcScenarios = [
  { statusY2: 'เลิกได้แล้ว',      statusY3: 'เลิกได้แล้ว',                  y2Health:true, y2HealthText:'ร่างกายแข็งแรงขึ้น ไม่ปวดหัว',      y3Health:true, y3HealthText:'สุขภาพดีขึ้นมาก', y3Money:true, y3MoneyText:'ประหยัดได้ 2,500 บาท/เดือน', y3Family:true, y3FamilyText:'ครอบครัวมีความสุข' },
  { statusY2: 'ลดพฤติกรรมได้',    statusY3: 'เลิกได้แล้ว',                  y2Health:true, y2HealthText:'ลดปริมาณการดื่มได้ชัดเจน',          y3Health:true, y3HealthText:'เลิกดื่มสำเร็จ', y3Work:true, y3WorkText:'ประสิทธิภาพการทำงานดีขึ้น' },
  { statusY2: 'ลดพฤติกรรมได้',    statusY3: 'ลดพฤติกรรมได้อย่างต่อเนื่อง', y2Money:true,  y2MoneyText:'ประหยัดเงินค่าเหล้า',               y3Health:true, y3HealthText:'ดื่มน้อยลงมาก', y3Money:true, y3MoneyText:'ประหยัดได้มากขึ้น' },
  { statusY2: 'ลดพฤติกรรมได้',    statusY3: 'ลดได้บางส่วน',                 y2Health:true, y2HealthText:'มีความพยายาม',                     y3Family:true, y3FamilyText:'ครอบครัวเข้าใจมากขึ้น' },
  { statusY2: 'ยังคงพฤติกรรมเดิม',statusY3: 'ไม่บรรลุเป้าหมาย',             y2Health:false,                                                    y3Health:false },
  { statusY2: 'ออกจากโครงการ',    statusY3: 'ไม่บรรลุเป้าหมาย' },
]

const tobScenarios = [
  { statusY2: 'เลิกได้แล้ว',      statusY3: 'เลิกได้แล้ว',                  y2Health:true, y2HealthText:'ปอดดีขึ้น หายใจสะดวก',            y3Health:true, y3HealthText:'เลิกสูบสำเร็จ', y3Money:true, y3MoneyText:'ประหยัดได้ 900 บาท/เดือน' },
  { statusY2: 'ลดพฤติกรรมได้',    statusY3: 'ลดพฤติกรรมได้อย่างต่อเนื่อง', y2Health:true, y2HealthText:'ลดเหลือ 5 มวน/วัน',                y3Health:true, y3HealthText:'ลดต่อเนื่อง ยังสูบอยู่บ้าง' },
  { statusY2: 'เลิกได้แล้ว',      statusY3: 'เลิกได้แล้ว',                  y2Accepted:true, y2AcceptedText:'ได้รับการยอมรับจากครอบครัว',   y3Health:true, y3HealthText:'เลิกได้ถาวร', y3Accepted:true },
  { statusY2: 'ลดพฤติกรรมได้',    statusY3: 'ลดได้บางส่วน',                 y2Health:true,                                                    y3Health:true, y3HealthText:'มีความพยายาม ยังสูบนานๆ ครั้ง' },
  { statusY2: 'ยังคงพฤติกรรมเดิม',statusY3: 'ไม่บรรลุเป้าหมาย' },
  { statusY2: 'ออกจากโครงการ',    statusY3: 'ไม่บรรลุเป้าหมาย' },
]

const dndScenarios = [
  { year2Result: 'ไม่มีรายงานดื่มแล้วขับตลอด 10 เดือน',                   year3Result: 'ไม่ดื่มแล้วขับตลอด 3 ปี บรรลุเป้าหมาย' },
  { year2Result: 'ลดความถี่การดื่มแล้วขับ เหลือ 1 ครั้ง/เดือน',            year3Result: 'เลิกดื่มแล้วขับได้ถาวร' },
  { year2Result: 'ใช้บริการรถรับส่ง ไม่ขับหลังดื่มได้บ้าง',                year3Result: 'เปลี่ยนพฤติกรรมได้บางส่วน ยังมีบ้างนานๆ ครั้ง' },
  { year2Result: 'เข้าร่วมกิจกรรมรณรงค์ในชุมชน',                          year3Result: 'บรรลุเป้าหมาย ไม่ดื่มแล้วขับเลย' },
  { year2Result: 'มีความพยายามแต่ยังมีการดื่มแล้วขับบ้าง',                  year3Result: 'ไม่บรรลุเป้าหมาย ยังคงพฤติกรรมเดิม' },
]

async function main() {
  const persons = await p.person.findMany({
    where: { villageId: 4 },
    include: { alcohol: true, tobacco: true, dnd: true },
    orderBy: { id: 'asc' },
  })

  console.log('🏥 ประเมินสมาชิกทั้งหมด บ้านทดสอบระบบ\n')

  let ai = 0, ti = 0, di = 0

  for (const person of persons) {
    if (person.id === 20) continue // นายทดสอบ สามปัจจัย ประเมินแล้ว

    const tags: string[] = []

    if (person.alcohol && person.alcohol.statusY3 === null && ai < alcScenarios.length) {
      await p.personAlcohol.update({ where: { personId: person.id }, data: alcScenarios[ai] })
      tags.push(`เหล้า→${alcScenarios[ai].statusY3}`)
      ai++
    }

    if (person.tobacco && person.tobacco.statusY3 === null && ti < tobScenarios.length) {
      await p.personTobacco.update({ where: { personId: person.id }, data: tobScenarios[ti] })
      tags.push(`บุหรี่→${tobScenarios[ti].statusY3}`)
      ti++
    }

    if (person.dnd && person.dnd.year3Result === null && di < dndScenarios.length) {
      await p.personDnd.update({ where: { personId: person.id }, data: dndScenarios[di] })
      tags.push(`ดื่มไม่ขับ→${dndScenarios[di].year3Result?.slice(0,20)}...`)
      di++
    }

    if (tags.length > 0) {
      console.log(`✅ ${person.name}`)
      tags.forEach(t => console.log(`   ${t}`))
    }
  }

  // ─── สรุปผล KPI ───
  console.log('\n' + '═'.repeat(50))
  const all = await p.person.findMany({
    where: { villageId: 4 },
    include: { alcohol: true, tobacco: true, dnd: true },
  })

  const alc = all.filter(x => x.alcohol)
  const tob = all.filter(x => x.tobacco)
  const dnd = all.filter(x => x.dnd)

  const alcAssessed = alc.filter(x => x.alcohol?.statusY3).length
  const tobAssessed = tob.filter(x => x.tobacco?.statusY3).length
  const dndAssessed = dnd.filter(x => x.dnd?.year3Result).length

  const PASS_STATUSES = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดพฤติกรรมได้', 'ลดได้บางส่วน']
  const alcPass = alc.filter(x => PASS_STATUSES.includes(x.alcohol?.statusY3 ?? '')).length
  const tobPass = tob.filter(x => PASS_STATUSES.includes(x.tobacco?.statusY3 ?? '')).length
  const dndPass = dnd.filter(x => {
    const r = x.dnd?.year3Result ?? ''
    return r.includes('บรรลุ') || r.includes('เลิก') || r.includes('ไม่ดื่ม')
  }).length

  console.log('📊 สรุป KPI หมู่บ้านทดสอบระบบ')
  console.log(`\n🍺 กลุ่มเหล้า  : ประเมินแล้ว ${alcAssessed}/${alc.length} คน`)
  if (alcAssessed === alc.length) {
    const pct = Math.round(alcPass / alc.length * 100)
    console.log(`   ผ่าน ${alcPass} คน (${pct}%) ${pct >= 10 ? '✅ KPI PASS ≥10%' : '❌ KPI FAIL <10%'}`)
  }
  alc.forEach(x => console.log(`   · ${x.name}: ${x.alcohol?.statusY3 ?? '-'}`))

  console.log(`\n🚬 กลุ่มบุหรี่ : ประเมินแล้ว ${tobAssessed}/${tob.length} คน`)
  if (tobAssessed === tob.length) {
    const pct = Math.round(tobPass / tob.length * 100)
    console.log(`   ผ่าน ${tobPass} คน (${pct}%) ${pct >= 15 ? '✅ KPI PASS ≥15%' : '❌ KPI FAIL <15%'}`)
  }
  tob.forEach(x => console.log(`   · ${x.name}: ${x.tobacco?.statusY3 ?? '-'}`))

  console.log(`\n🚗 ดื่มไม่ขับ  : ประเมินแล้ว ${dndAssessed}/${dnd.length} คน`)
  console.log(`   บรรลุเป้า ${dndPass} คน`)
  dnd.forEach(x => console.log(`   · ${x.name}: ${x.dnd?.year3Result?.slice(0, 35) ?? '-'}`))
}

main().catch(console.error).finally(() => p.$disconnect())
