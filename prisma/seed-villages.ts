import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // ---- ลบข้อมูลทั้งหมดยกเว้น User ----
  await prisma.alcoholMember.deleteMany()
  await prisma.tobaccoMember.deleteMany()
  await prisma.drinkNotDriveMember.deleteMany()
  await prisma.screeningResult.deleteMany()
  await prisma.alcoholParticipant.deleteMany()
  await prisma.alcoholResult.deleteMany()
  await prisma.tobaccoParticipant.deleteMany()
  await prisma.tobaccoResult.deleteMany()
  await prisma.drinkNotDrive.deleteMany()
  await prisma.communityStats.deleteMany()
  await prisma.envItem.deleteMany()
  await prisma.communityOrg.deleteMany()
  await prisma.communityBackground.deleteMany()
  await prisma.village.deleteMany()
  console.log('✓ ลบข้อมูลเก่าทั้งหมดแล้ว')

  // ---- ข้อมูลหมู่บ้าน 10 แห่ง ทุกภาค ----
  const villages = [
    { villageName: 'ป่าแดง',      villageNo: '3', tambon: 'แม่ริม',     amphoe: 'แม่ริม',         province: 'เชียงใหม่',         zone: 'เหนือ',      coordinator: 'นายสมชาย ใจดี',         phone: '0812345601', registeredPopulation: 342, actualPopulation: 298, householdCount: 87  },
    { villageName: 'ทุ่งทอง',     villageNo: '5', tambon: 'แม่คะ',      amphoe: 'ฝาง',            province: 'เชียงใหม่',         zone: 'เหนือ',      coordinator: 'นางสาวมาลี สุขใจ',      phone: '0812345602', registeredPopulation: 215, actualPopulation: 180, householdCount: 52  },
    { villageName: 'กลางสามัคคี', villageNo: '2', tambon: 'บางรัก',     amphoe: 'เมืองสมุทรสาคร', province: 'สมุทรสาคร',         zone: 'กลาง',      coordinator: 'นายประสิทธิ์ ฉลาด',     phone: '0812345603', registeredPopulation: 487, actualPopulation: 412, householdCount: 123 },
    { villageName: 'ใหม่พัฒนา',   villageNo: '7', tambon: 'บางน้ำเปรี้ยว', amphoe: 'บางน้ำเปรี้ยว', province: 'ฉะเชิงเทรา',      zone: 'กลาง',      coordinator: 'นางวิไล แสงทอง',       phone: '0812345604', registeredPopulation: 276, actualPopulation: 241, householdCount: 68  },
    { villageName: 'โคกสูง',      villageNo: '4', tambon: 'สีดา',       amphoe: 'สีดา',           province: 'นครราชสีมา',        zone: 'อีสาน',     coordinator: 'นายบุญมี ศรีสุข',       phone: '0812345605', registeredPopulation: 398, actualPopulation: 350, householdCount: 95  },
    { villageName: 'หนองแวง',     villageNo: '6', tambon: 'หนองแวง',    amphoe: 'พล',             province: 'ขอนแก่น',           zone: 'อีสาน',     coordinator: 'นายวิชัย ดาวเรือง',     phone: '0812345606', registeredPopulation: 523, actualPopulation: 468, householdCount: 134 },
    { villageName: 'ท่าเรือ',     villageNo: '1', tambon: 'ท่าเรือ',    amphoe: 'เมืองระยอง',     province: 'ระยอง',             zone: 'ตะวันออก',  coordinator: 'นางสาวสุดา มีสุข',      phone: '0812345607', registeredPopulation: 189, actualPopulation: 162, householdCount: 45  },
    { villageName: 'ไทรโยค',      villageNo: '3', tambon: 'ไทรโยค',     amphoe: 'ไทรโยค',         province: 'กาญจนบุรี',         zone: 'ตะวันตก',   coordinator: 'นายณรงค์ พรมดี',        phone: '0812345608', registeredPopulation: 234, actualPopulation: 198, householdCount: 58  },
    { villageName: 'คีรีวง',      villageNo: '2', tambon: 'กำโลน',      amphoe: 'ลานสกา',         province: 'นครศรีธรรมราช',     zone: 'ใต้บน',     coordinator: 'นายอนันต์ รักษ์ดี',     phone: '0812345609', registeredPopulation: 312, actualPopulation: 275, householdCount: 78  },
    { villageName: 'ปะนาเระ',     villageNo: '5', tambon: 'ปะนาเระ',    amphoe: 'ปะนาเระ',        province: 'ปัตตานี',           zone: 'ใต้ล่าง',   coordinator: 'นายอับดุลรอหมาน มานะ',  phone: '0812345610', registeredPopulation: 445, actualPopulation: 389, householdCount: 112 },
  ]

  const OUTCOMES_BASE = { y1Money: false, y1MoneyText: null, y1Property: false, y1PropertyText: null, y1Family: false, y1FamilyText: null, y1Health: false, y1HealthText: null, y1Work: false, y1WorkText: null, y1Accepted: false, y1AcceptedText: null, y1Other: false, y1OtherText: null, y2Money: false, y2MoneyText: null, y2Property: false, y2PropertyText: null, y2Family: false, y2FamilyText: null, y2Health: false, y2HealthText: null, y2Work: false, y2WorkText: null, y2Accepted: false, y2AcceptedText: null, y2Other: false, y2OtherText: null, y3Money: false, y3MoneyText: null, y3Property: false, y3PropertyText: null, y3Family: false, y3FamilyText: null, y3Health: false, y3HealthText: null, y3Work: false, y3WorkText: null, y3Accepted: false, y3AcceptedText: null, y3Other: false, y3OtherText: null }

  for (const vData of villages) {
    const pop = vData.registeredPopulation
    const v = await prisma.village.create({ data: vData })
    console.log(`  ✓ สร้างหมู่บ้าน: บ้าน${v.villageName}`)

    // Screening results year 1
    const screened = Math.round(pop * 0.82)
    await prisma.screeningResult.create({ data: {
      villageId: v.id, year: 1,
      screenedCount: screened,
      alcoholRiskLow:  Math.round(screened * 0.12),
      alcoholRisk:     Math.round(screened * 0.18),
      alcoholDanger:   Math.round(screened * 0.06),
      alcoholAddicted: Math.round(screened * 0.03),
      alcoholNone:     Math.round(screened * 0.61),
      tobaccoCount:    Math.round(screened * 0.21),
      tobaccoNone:     Math.round(screened * 0.79),
      drinkAndDrive:   Math.round(screened * 0.08),
      drinkNotDriveN:  Math.round(screened * 0.92),
    }})

    // Alcohol members (5-7 คน)
    const alcoholNames = ['นายสุรชัย บุญมา', 'นายอนุชา หาญกล้า', 'นายเกียรติศักดิ์ ดวงดี', 'นายพิทักษ์ ศรีทอง', 'นางสาวดาว สดใส', 'นายมานะ สู้งาน', 'นายชัยวัฒน์ มั่นใจ']
    const drinkTypes = ['เสี่ยงต่ำ', 'เสี่ยง', 'อันตราย', 'ติด', 'เสี่ยง', 'เสี่ยงต่ำ', 'อันตราย']
    for (let i = 0; i < 6; i++) {
      await prisma.alcoholMember.create({ data: {
        villageId: v.id, name: alcoholNames[i], drinkType: drinkTypes[i],
        ...OUTCOMES_BASE,
        y1Money: true,   y1MoneyText: `ประหยัดได้ ${(i + 1) * 500} บาท/เดือน`,
        y1Health: true,  y1HealthText: 'สุขภาพดีขึ้น นอนหลับได้ดี',
        y1Family: i % 2 === 0, y1FamilyText: i % 2 === 0 ? 'ครอบครัวมีความสุขมากขึ้น' : null,
        y2Money: i < 3,  y2MoneyText: i < 3 ? `ประหยัดสะสมได้ ${(i + 1) * 6000} บาท` : null,
        y2Accepted: i < 4, y2AcceptedText: i < 4 ? 'ชุมชนให้การยอมรับ' : null,
      }})
    }

    // Tobacco members (4-5 คน)
    const tobaccoNames = ['นายสงกรานต์ ยิ้มดี', 'นายณัฐพล แก้วใส', 'นางสาวสุภาพร รักสะอาด', 'นายอำนาจ พึ่งตน', 'นายวีระ ตั้งใจดี']
    const smokeTypes = ['สูบ', 'สูบ', 'ไม่สูบ', 'สูบ', 'สูบ']
    for (let i = 0; i < 4; i++) {
      await prisma.tobaccoMember.create({ data: {
        villageId: v.id, name: tobaccoNames[i], smokeType: smokeTypes[i],
        ...OUTCOMES_BASE,
        y1Health: true, y1HealthText: 'ปอดแข็งแรงขึ้น ไม่ไอเรื้อรัง',
        y1Money: true,  y1MoneyText: `ประหยัดค่าบุหรี่ ${(i + 1) * 300} บาท/เดือน`,
        y2Health: i < 3, y2HealthText: i < 3 ? 'สุขภาพดีขึ้นชัดเจน' : null,
      }})
    }

    // Drink not drive members (3-4 คน)
    const dndNames = ['นายกิตติ ปลอดภัย', 'นายธีรพงษ์ รอบคอบ', 'นายศักดิ์ชาย ใจเย็น', 'นายวรวิทย์ มีสติ']
    const dndTypes = ['ดื่มไม่ขับ', 'ไม่ดื่ม', 'ดื่มไม่ขับ', 'ดื่มแล้วขับ']
    for (let i = 0; i < 3; i++) {
      await prisma.drinkNotDriveMember.create({ data: {
        villageId: v.id, name: dndNames[i], drinkType: dndTypes[i],
        year1Result: 'ปลอดภัยไม่มีอุบัติเหตุ',
        year2Result: i < 2 ? 'ยังคงรักษาพฤติกรรมดี ไม่มีอุบัติเหตุ' : null,
        year3Result: null,
      }})
    }

    // Env items
    await prisma.envItem.createMany({ data: [
      { villageId: v.id, itemType: 'funeral',     hasItem: true,  itemCount: 0, result1: 'จัดงานศพปลอดเหล้าสำเร็จ 3 งาน',   result2: 'จัดได้ต่อเนื่อง 5 งาน', result3: null },
      { villageId: v.id, itemType: 'tradition',   hasItem: true,  itemCount: 0, result1: 'งานประเพณีลดเหล้า 2 งาน',          result2: 'ขยายผลทุกงาน',          result3: null },
      { villageId: v.id, itemType: 'shop',        hasItem: false, itemCount: 0, result1: null, result2: null, result3: null },
      { villageId: v.id, itemType: 'bannedPlace', hasItem: true,  itemCount: 0, result1: 'กำหนดพื้นที่ห้ามดื่มในวัดและโรงเรียน', result2: null, result3: null },
    ]})

    // Community orgs
    await prisma.communityOrg.createMany({ data: [
      { villageId: v.id, orgType: 'school',        hasParticipation: true,  result1: 'จัดกิจกรรมให้ความรู้นักเรียน',    result2: 'ขยายสู่ผู้ปกครอง', result3: null },
      { villageId: v.id, orgType: 'temple',        hasParticipation: true,  result1: 'พระสงฆ์ร่วมรณรงค์งดเหล้า',       result2: 'จัดธรรมะสัญจร',    result3: null },
      { villageId: v.id, orgType: 'localGov',      hasParticipation: true,  result1: 'อบต.สนับสนุนงบประมาณ 15,000 บาท', result2: 'ต่อยอดโครงการ',    result3: null },
      { villageId: v.id, orgType: 'villageAdmin',  hasParticipation: true,  result1: 'ผู้ใหญ่บ้านเป็นแกนนำหลัก',       result2: null,                result3: null },
      { villageId: v.id, orgType: 'healthStation', hasParticipation: true,  result1: 'รพ.สต.คัดกรองและติดตาม',          result2: 'เยี่ยมบ้านกลุ่มเสี่ยง', result3: null },
      { villageId: v.id, orgType: 'organization',  hasParticipation: false, result1: null, result2: null, result3: null },
    ]})

    // Community backgrounds
    await prisma.communityBackground.createMany({ data: [
      { villageId: v.id, itemType: 'calendar',      hasItem: true,  fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'riskArea',      hasItem: true,  fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'participation', hasItem: true,  fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'teamCapacity',  hasItem: false, fileUrl: null, fileName: null },
      { villageId: v.id, itemType: 'history',       hasItem: true,  fileUrl: null, fileName: null },
    ]})
  }

  console.log('\n✅ สร้างข้อมูลจำลองครบ 10 หมู่บ้าน ทุกภาค')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
