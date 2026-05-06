import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.alcoholMember.deleteMany()
  await prisma.tobaccoMember.deleteMany()
  await prisma.drinkNotDriveMember.deleteMany()
  await prisma.screeningResult.deleteMany()
  await prisma.envItem.deleteMany()
  await prisma.communityOrg.deleteMany()
  await prisma.communityBackground.deleteMany()
  await prisma.village.deleteMany()
  console.log('✓ ลบข้อมูลเก่าทั้งหมดแล้ว')

  // ใช้ user ที่มีอยู่จริงในระบบ
  const creator = await prisma.user.findFirst({ where: { email: 'sdn.warehouse@gmail.com' } })
  if (!creator) throw new Error('ไม่พบ user กรุณาสร้าง account ก่อน')
  console.log(`✓ ใช้บัญชี: ${creator.firstName} ${creator.lastName} (#${creator.id})`)

  const villages = [
    { villageName: 'ป่าแดง',      villageNo: '3', tambon: 'แม่ริม',       amphoe: 'แม่ริม',          province: 'เชียงใหม่',      zone: 'เหนือบน',   coordinator: 'นายสมชาย ใจดี',        phone: '0812345601', registeredPopulation: 342, actualPopulation: 298, householdCount: 87  },
    { villageName: 'ริมโขง',      villageNo: '4', tambon: 'เวียง',         amphoe: 'เชียงของ',        province: 'เชียงราย',       zone: 'เหนือบน',   coordinator: 'นายวิรัตน์ ดวงดี',     phone: '0812345602', registeredPopulation: 398, actualPopulation: 350, householdCount: 98  },
    { villageName: 'บางบัวทอง',   villageNo: '5', tambon: 'บางบัวทอง',    amphoe: 'บางบัวทอง',       province: 'นนทบุรี',         zone: 'กลาง',      coordinator: 'นายประสิทธิ์ ฉลาด',    phone: '0812345603', registeredPopulation: 876, actualPopulation: 741, householdCount: 256 },
    { villageName: 'ท่าเรือ',     villageNo: '1', tambon: 'ท่าเรือ',       amphoe: 'ท่าเรือ',         province: 'พระนครศรีอยุธยา', zone: 'กลาง',      coordinator: 'นางรัตนา สายทอง',      phone: '0812345604', registeredPopulation: 387, actualPopulation: 334, householdCount: 108 },
    { villageName: 'โคกสูง',      villageNo: '4', tambon: 'สีดา',          amphoe: 'สีดา',             province: 'นครราชสีมา',     zone: 'อีสานบน',   coordinator: 'นายบุญมี ศรีสุข',       phone: '0812345605', registeredPopulation: 398, actualPopulation: 350, householdCount: 112 },
    { villageName: 'หนองแวง',     villageNo: '6', tambon: 'หนองแวง',       amphoe: 'พล',               province: 'ขอนแก่น',        zone: 'อีสานล่าง', coordinator: 'นายวิชัย ดาวเรือง',    phone: '0812345606', registeredPopulation: 523, actualPopulation: 468, householdCount: 148 },
    { villageName: 'มาบตาพุด',    villageNo: '6', tambon: 'มาบตาพุด',      amphoe: 'เมืองระยอง',      province: 'ระยอง',           zone: 'ตะวันออก',  coordinator: 'นายเอกชัย รุ่งเรือง',  phone: '0812345607', registeredPopulation: 623, actualPopulation: 541, householdCount: 178 },
    { villageName: 'ไทรโยค',      villageNo: '3', tambon: 'ไทรโยค',        amphoe: 'ไทรโยค',           province: 'กาญจนบุรี',      zone: 'ตะวันตก',   coordinator: 'นายณรงค์ พรมดี',       phone: '0812345608', registeredPopulation: 256, actualPopulation: 221, householdCount: 67  },
    { villageName: 'คีรีวง',      villageNo: '2', tambon: 'กำโลน',         amphoe: 'ลานสกา',           province: 'นครศรีธรรมราช', zone: 'ใต้บน',     coordinator: 'นายอนันต์ รักษ์ดี',    phone: '0812345609', registeredPopulation: 312, actualPopulation: 275, householdCount: 88  },
    { villageName: 'ปะนาเระ',     villageNo: '5', tambon: 'ปะนาเระ',       amphoe: 'ปะนาเระ',          province: 'ปัตตานี',        zone: 'ใต้ล่าง',          coordinator: 'นายอับดุลรอหมาน มานะ', phone: '0812345610', registeredPopulation: 445, actualPopulation: 389, householdCount: 124 },
    { villageName: 'ลาดกระบัง',   villageNo: '8', tambon: 'ลาดกระบัง',     amphoe: 'ลาดกระบัง',        province: 'กรุงเทพมหานคร',  zone: 'กรุงเทพมหานคร',   coordinator: 'นางสาวพรทิพย์ สว่างใจ', phone: '0812345611', registeredPopulation: 892, actualPopulation: 743, householdCount: 234 },
    { villageName: 'เถิน',         villageNo: '5', tambon: 'เถิน',           amphoe: 'เถิน',              province: 'ลำปาง',          zone: 'เหนือล่าง',        coordinator: 'นายธีรยุทธ คำมา',        phone: '0812345612', registeredPopulation: 287, actualPopulation: 251, householdCount: 71  },
  ]

  const OUTCOMES_BASE = {
    y1Money: false, y1MoneyText: null, y1Property: false, y1PropertyText: null,
    y1Family: false, y1FamilyText: null, y1Health: false, y1HealthText: null,
    y1Work: false, y1WorkText: null, y1Accepted: false, y1AcceptedText: null,
    y1Other: false, y1OtherText: null,
    y2Money: false, y2MoneyText: null, y2Property: false, y2PropertyText: null,
    y2Family: false, y2FamilyText: null, y2Health: false, y2HealthText: null,
    y2Work: false, y2WorkText: null, y2Accepted: false, y2AcceptedText: null,
    y2Other: false, y2OtherText: null,
    y3Money: false, y3MoneyText: null, y3Property: false, y3PropertyText: null,
    y3Family: false, y3FamilyText: null, y3Health: false, y3HealthText: null,
    y3Work: false, y3WorkText: null, y3Accepted: false, y3AcceptedText: null,
    y3Other: false, y3OtherText: null,
  }

  for (const vData of villages) {
    const v = await prisma.village.create({ data: { ...vData, creatorId: creator.id } })

    const pop     = v.registeredPopulation
    const screened = Math.round(pop * 0.82)
    const alRiskLow  = Math.round(screened * 0.12)
    const alRisk     = Math.round(screened * 0.18)
    const alDanger   = Math.round(screened * 0.06)
    const alAddicted = Math.round(screened * 0.03)
    const tobacco    = Math.round(screened * 0.21)
    const dnDrive    = Math.round(screened * 0.08)
    const dndN       = Math.round(screened * 0.85)

    await prisma.screeningResult.create({ data: {
      villageId: v.id, year: 1,
      screenedCount:   screened,
      alcoholRiskLow:  alRiskLow,
      alcoholRisk:     alRisk,
      alcoholDanger:   alDanger,
      alcoholAddicted: alAddicted,
      alcoholNone:     Math.max(0, screened - alRiskLow - alRisk - alDanger - alAddicted),
      tobaccoCount:    tobacco,
      tobaccoNone:     Math.max(0, screened - tobacco),
      drinkAndDrive:   dnDrive,
      drinkNotDriveN:  dndN,
    }})

    // Alcohol members
    for (const [name, drinkType, savingPerMonth] of [
      ['นายสุรชัย บุญมา',      'เสี่ยงต่ำ', 500],
      ['นายอนุชา หาญกล้า',     'เสี่ยง',    800],
      ['นายเกียรติศักดิ์ ดวง', 'อันตราย',  1200],
      ['นายพิทักษ์ ศรีทอง',    'ติด',      1500],
    ] as [string, string, number][]) {
      await prisma.alcoholMember.create({ data: {
        villageId: v.id, name, drinkType,
        ...OUTCOMES_BASE,
        y1Money: true, y1MoneyText: `ประหยัดได้ ${savingPerMonth} บาท/เดือน`,
        y1Health: true, y1HealthText: 'สุขภาพแข็งแรงขึ้น นอนหลับได้ดีขึ้น',
        y1Family: true, y1FamilyText: 'ความสัมพันธ์ในครอบครัวดีขึ้น',
        y2Money: true, y2MoneyText: `ประหยัดสะสม ${savingPerMonth * 12} บาท`,
        y2Health: true, y2HealthText: 'ผลเลือดดีขึ้น ไม่มีโรคแทรกซ้อน',
      }})
    }

    // Tobacco members
    for (const [name, smokeType] of [
      ['นายสงกรานต์ ยิ้มดี',     'สูบ'],
      ['นางสาวสุภาพร รักสะอาด',  'ไม่สูบ'],
      ['นายณัฐพล แก้วใส',        'สูบ'],
    ] as [string, string][]) {
      await prisma.tobaccoMember.create({ data: {
        villageId: v.id, name, smokeType,
        ...OUTCOMES_BASE,
        y1Health: true, y1HealthText: 'ปอดแข็งแรงขึ้น ไม่ไอเรื้อรัง',
        y1Money: true,  y1MoneyText: 'ประหยัดค่าบุหรี่ 300 บาท/เดือน',
      }})
    }

    // Drink-not-drive members
    for (const [name, drinkType] of [
      ['นายกิตติ ปลอดภัย',  'ดื่มไม่ขับ'],
      ['นายธีรพงษ์ รอบคอบ', 'ไม่ดื่ม'],
      ['นายศักดิ์ชาย ใจเย็น', 'ดื่มไม่ขับ'],
    ] as [string, string][]) {
      await prisma.drinkNotDriveMember.create({ data: {
        villageId: v.id, name, drinkType,
        year1Result: 'ไม่มีอุบัติเหตุ ปลอดภัยตลอดปี',
        year2Result: 'รักษาพฤติกรรมได้ต่อเนื่อง',
        year3Result: null,
      }})
    }

    await prisma.envItem.createMany({ data: [
      { villageId: v.id, itemType: 'funeral',     hasItem: true,  itemCount: 0, result1: 'จัดงานศพปลอดเหล้าสำเร็จ 3 งาน', result2: 'ขยายผลต่อเนื่อง 5 งาน', result3: null },
      { villageId: v.id, itemType: 'tradition',   hasItem: true,  itemCount: 0, result1: 'งานประเพณีลดเหล้า 2 งาน',        result2: 'ขยายผลทุกงาน',          result3: null },
      { villageId: v.id, itemType: 'shop',        hasItem: false, itemCount: 0, result1: null, result2: null,                result3: null },
      { villageId: v.id, itemType: 'bannedPlace', hasItem: true,  itemCount: 0, result1: 'กำหนดพื้นที่ห้ามดื่มในวัดและโรงเรียน', result2: null, result3: null },
    ]})

    await prisma.communityOrg.createMany({ data: [
      { villageId: v.id, orgType: 'school',        hasParticipation: true,  result1: 'จัดกิจกรรมให้ความรู้นักเรียน', result2: 'ขยายสู่ผู้ปกครอง', result3: null },
      { villageId: v.id, orgType: 'temple',        hasParticipation: true,  result1: 'พระสงฆ์ร่วมรณรงค์งดเหล้า',    result2: 'จัดธรรมะสัญจร',    result3: null },
      { villageId: v.id, orgType: 'localGov',      hasParticipation: true,  result1: 'อบต.สนับสนุนงบ 15,000 บาท',   result2: 'ต่อยอดโครงการ',    result3: null },
      { villageId: v.id, orgType: 'villageAdmin',  hasParticipation: true,  result1: 'ผู้ใหญ่บ้านเป็นแกนนำหลัก',    result2: null,                result3: null },
      { villageId: v.id, orgType: 'healthStation', hasParticipation: true,  result1: 'รพ.สต.คัดกรองและติดตาม',       result2: 'เยี่ยมบ้านกลุ่มเสี่ยง', result3: null },
      { villageId: v.id, orgType: 'organization',  hasParticipation: false, result1: null, result2: null,             result3: null },
    ]})

    await prisma.communityBackground.createMany({ data: [
      { villageId: v.id, itemType: 'calendar',      hasItem: true,  fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'riskArea',      hasItem: true,  fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'participation', hasItem: true,  fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'teamCapacity',  hasItem: false, fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'history',       hasItem: true,  fileUrl: null, fileName: null },
    ]})

    console.log(`  ✓ บ้าน${v.villageName} (${v.zone})`)
  }

  console.log(`\n✅ สร้างข้อมูลจำลองครบ 10 หมู่บ้าน ผูกกับ user #${creator.id}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
