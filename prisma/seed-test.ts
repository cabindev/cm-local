import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ALCOHOL_NAMES = [
  'นายสมชาย ใจดี', 'นายวิชัย ดาวเรือง', 'นายบุญมี ศรีสุข',
  'นายประสิทธิ์ คำดี', 'นายอนันต์ รักษ์ดี',
]
const TOBACCO_NAMES = [
  'นางสาวมาลี สุขใจ', 'นายณรงค์ พรมดี', 'นายสุรชัย มั่นคง',
  'นางวิไล แสงทอง', 'นายอับดุล มานะ',
]
const DND_NAMES = [
  'นายเกรียงไกร โชคดี', 'นายพิทักษ์ ใจกล้า', 'นายสถาพร ยิ้มแย้ม',
  'นายชัยวัฒน์ สว่างใจ', 'นางสาวสุดา มีสุข',
]

const DRINK_TYPES  = ['เสี่ยงต่ำ', 'เสี่ยงสูง', 'อันตราย', 'ติดสุรา']
const SMOKE_DETAIL = ['สูบประจำ 5-10 มวน', 'สูบประจำ 11-20 มวน', 'สูบประจำ มากกว่า 20 มวน', 'นานๆ ครั้ง']
const DND_DETAIL   = ['เคยดื่มแล้วขับ 1 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 2 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 3 ครั้งต่อเดือน', 'ไม่เคยดื่มแล้วขับ']
const STATUSES     = ['ตั้งใจเลิก', 'มีแนวโน้มที่จะเลิก', 'อยากลดแต่ยังมีอุปสรรค']

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

async function main() {
  console.log('🌱 สร้างข้อมูลทดสอบ...')

  // สร้างหมู่บ้านทดสอบ
  const village = await prisma.village.create({
    data: {
      villageName: 'ทดสอบระบบ',
      villageNo: '9',
      tambon: 'แม่ริม',
      amphoe: 'แม่ริม',
      province: 'เชียงใหม่',
      zone: 'เหนือบน',
      coordinator: 'นายทดสอบ ระบบดี',
      phone: '0812345999',
      registeredPopulation: 312,
      actualPopulation: 287,
      householdCount: 84,
    },
  })
  console.log(`✅ สร้างหมู่บ้าน: บ้านทดสอบระบบ หมู่ 9 (id=${village.id})`)

  // ผลคัดกรอง
  await prisma.screeningResult.create({
    data: {
      villageId: village.id,
      year: 1,
      screenedCount: 287,
      alcoholRiskLow: 28,
      alcoholRisk: 15,
      alcoholDanger: 8,
      alcoholAddicted: 3,
      alcoholNone: 233,
      tobaccoCount: 22,
      tobaccoNone: 265,
      drinkAndDrive: 19,
      drinkNotDriveN: 45,
    },
  })
  console.log('✅ สร้างผลคัดกรอง')

  // ข้อมูลพื้นฐานชุมชน
  await prisma.communityBackground.createMany({
    data: [
      { villageId: village.id, itemType: 'communityCalendar',   hasItem: true,  fileName: 'ปฏิทินชุมชน.pdf' },
      { villageId: village.id, itemType: 'riskLocation',        hasItem: true,  fileName: 'แผนที่เสี่ยง.pdf' },
      { villageId: village.id, itemType: 'participationPolicy', hasItem: false },
      { villageId: village.id, itemType: 'capacityPolicy',      hasItem: false },
      { villageId: village.id, itemType: 'communityHistory',    hasItem: true,  fileName: 'ประวัติหมู่บ้าน.docx' },
    ],
  })
  console.log('✅ สร้างข้อมูลพื้นฐานชุมชน')

  // สมาชิก 15 คน
  let count = 0

  // กลุ่มเหล้า 5 คน
  for (const name of ALCOHOL_NAMES) {
    await prisma.person.create({
      data: {
        villageId: village.id,
        name,
        alcohol: {
          create: {
            drinkType: pick(DRINK_TYPES),
            statusY1: pick(STATUSES),
            y1Health: true,   y1HealthText: 'ร่างกายแข็งแรงขึ้น',
            y1Money: true,    y1MoneyText: 'ประหยัดเงินได้มากขึ้น',
            y1Family: Math.random() > 0.5,
            y2Health: Math.random() > 0.5,
            y2Work:   Math.random() > 0.5,
          },
        },
      },
    })
    count++
    console.log(`  + เพิ่มสมาชิกเหล้า: ${name}`)
  }

  // กลุ่มบุหรี่ 5 คน
  for (const name of TOBACCO_NAMES) {
    await prisma.person.create({
      data: {
        villageId: village.id,
        name,
        tobacco: {
          create: {
            smokeType: pick(SMOKE_DETAIL),
            statusY1: pick(STATUSES),
            y1Health: true,   y1HealthText: 'ปอดดีขึ้น',
            y1Money: true,    y1MoneyText: 'ไม่ต้องซื้อบุหรี่',
            y1Accepted: Math.random() > 0.5,
            y2Health: Math.random() > 0.5,
          },
        },
      },
    })
    count++
    console.log(`  + เพิ่มสมาชิกบุหรี่: ${name}`)
  }

  // กลุ่มดื่มไม่ขับ 5 คน
  for (const name of DND_NAMES) {
    await prisma.person.create({
      data: {
        villageId: village.id,
        name,
        dnd: {
          create: {
            drinkType: pick(DND_DETAIL),
            year1Result: 'ปรับเปลี่ยนพฤติกรรมได้ ไม่ดื่มก่อนขับ',
            year2Result: Math.random() > 0.5 ? 'ยังคงรักษาพฤติกรรมที่ดี' : '',
          },
        },
      },
    })
    count++
    console.log(`  + เพิ่มสมาชิกดื่มไม่ขับ: ${name}`)
  }

  console.log(`\n✅ เสร็จสิ้น — สร้างสมาชิกทั้งหมด ${count} คน`)
  console.log(`🔗 ดูที่: /dashboard/villages/${village.id}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
