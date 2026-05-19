import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NAMES = [
  'นายสมศักดิ์ รักชาติ', 'นางสาวสมศรี ทวีสุข', 'นายวิชัย มานะดี', 'นางมาลี มีทรัพย์',
  'นายบุญมา ใจซื่อ', 'นางบุญมี ศรีสุข', 'นายประสิทธิ์ สิทธิศักดิ์', 'นางสาวสุดา ฟ้าใส',
  'นายอนันต์ มั่นคง', 'นางวิไล แสงสว่าง', 'นายอับดุล มานะ', 'นายชัยวัฒน์ เก่งกล้า',
  'นางสาวจารุวรรณ ขวัญดี', 'นายธนพล พลเยี่ยม', 'นายธีรเทพ เติมเต็ม', 'นางมยุรี มณีรัตน์',
  'นายกิตติพงษ์ คงกระพัน', 'นางสาวพิมพ์ใจ สุขสบาย', 'นายปรีชา ประเสริฐ', 'นางกมลวรรณ ขวัญชัย'
]

const DRINK_TYPES = ['เสี่ยงต่ำ', 'เสี่ยงสูง', 'อันตราย', 'ติดสุรา']
const SMOKE_TYPES = ['สูบประจำ 5-10 มวน', 'สูบประจำ 11-20 มวน', 'สูบประจำ มากกว่า 20 มวน', 'นานๆ ครั้ง']
const DND_TYPES = ['เคยดื่มแล้วขับ 1 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 2 ครั้งต่อเดือน', 'ไม่เคยดื่มแล้วขับ']
const STATUSES = ['ตั้งใจเลิก', 'มีแนวโน้มที่จะเลิก', 'อยากลดแต่ยังมีอุปสรรค']

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

async function createVillage(name: string, no: string, tambon: string, amphoe: string, province: string, zone: string) {
  const village = await prisma.village.create({
    data: {
      villageName: name,
      villageNo: no,
      tambon: tambon,
      amphoe: amphoe,
      province: province,
      zone: zone,
      coordinator: `ผู้ประสานงาน ${name}`,
      phone: '08' + Math.floor(10000000 + Math.random() * 90000000),
      registeredPopulation: 500,
      actualPopulation: 450,
      householdCount: 150,
    },
  })

  // Add screening results
  await prisma.screeningResult.create({
    data: {
      villageId: village.id,
      year: 1,
      screenedCount: 450,
      alcoholRiskLow: 50,
      alcoholRisk: 30,
      alcoholDanger: 10,
      alcoholAddicted: 5,
      alcoholNone: 355,
      tobaccoCount: 40,
      tobaccoNone: 410,
      drinkAndDrive: 20,
      drinkNotDriveN: 80,
    },
  })

  // Add 10 members
  for (let i = 0; i < 10; i++) {
    const personName = NAMES[(Math.floor(Math.random() * NAMES.length) + i) % NAMES.length]
    const type = Math.floor(Math.random() * 3) // 0: Alcohol, 1: Tobacco, 2: DND

    const personData: any = {
      villageId: village.id,
      name: `${personName} (${name})`,
      gender: Math.random() > 0.5 ? 'ชาย' : 'หญิง',
    }

    if (type === 0) {
      personData.alcohol = {
        create: {
          drinkType: pick(DRINK_TYPES),
          statusY1: pick(STATUSES),
          y1Health: true,
          y1Money: true,
          y1Family: Math.random() > 0.5,
        }
      }
    } else if (type === 1) {
      personData.tobacco = {
        create: {
          smokeType: pick(SMOKE_TYPES),
          statusY1: pick(STATUSES),
          y1Health: true,
          y1Money: true,
          y1Accepted: Math.random() > 0.5,
        }
      }
    } else {
      personData.dnd = {
        create: {
          drinkType: pick(DND_TYPES),
          year1Result: 'ดีขึ้น',
        }
      }
    }

    await prisma.person.create({ data: personData })
  }

  return village
}

async function main() {
  console.log('🌱 กำลังสร้างข้อมูลทดสอบ 2 หมู่บ้าน...')

  const v1 = await createVillage('บ้านหนองนา', '1', 'โนนไทย', 'โนนไทย', 'นครราชสีมา', 'อีสานล่าง')
  console.log(`✅ สร้างหมู่บ้าน: ${v1.villageName} (id=${v1.id}) พร้อมสมาชิก 10 คน`)

  const v2 = await createVillage('บ้านสันป่าเลียง', '4', 'หนองหอย', 'เมือง', 'เชียงใหม่', 'เหนือบน')
  console.log(`✅ สร้างหมู่บ้าน: ${v2.villageName} (id=${v2.id}) พร้อมสมาชิก 10 คน`)

  console.log('\n🚀 เสร็จสิ้น!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
