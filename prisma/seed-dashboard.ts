import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── helpers ────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function bool(prob = 0.5) { return Math.random() < prob }
function names(arr: string[], min = 1, max = 3): string[] {
  const n = rand(min, max)
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// ── lookup data ────────────────────────────────────────────────────────────────

const DRINK_TYPES     = ['เสี่ยงต่ำ', 'เสี่ยงสูง', 'อันตราย', 'ติดสุรา']
const SMOKE_TYPES     = ['สูบประจำ', 'นานๆ ครั้ง']
const DND_DRINK_TYPES = ['เคยดื่มแล้วขับ 1 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 2 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 3 ครั้งต่อเดือน']

const ALC_STATUS_Y1 = ['ตั้งใจเลิก', 'มีแนวโน้มที่จะเลิก', 'อยากลดแต่ยังมีอุปสรรค']
const ALC_STATUS_Y2 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ']
const ALC_STATUS_Y3 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดได้บางส่วน', 'ไม่บรรลุเป้าหมาย']
const TOB_STATUS_Y1 = ['ตั้งใจเลิก', 'มีแนวโน้มที่จะเลิก', 'อยากลดแต่ยังมีอุปสรรค']
const TOB_STATUS_Y2 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ']
const TOB_STATUS_Y3 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดได้บางส่วน', 'ไม่บรรลุเป้าหมาย']
const DND_RESULT_Y1 = ['ตั้งใจดื่มไม่ขับ', 'มีแนวโน้มจะเปลี่ยนพฤติกรรม', 'อยากเปลี่ยนแต่ยังมีอุปสรรค']
const DND_RESULT_Y2 = ['บรรลุเป้าหมาย', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ']
const DND_RESULT_Y3 = ['บรรลุเป้าหมายอย่างต่อเนื่อง', 'ลดพฤติกรรมได้บางส่วน', 'ยังคงพฤติกรรมเดิม', 'ไม่บรรลุเป้าหมาย']

const PERSON_NAMES = [
  'นายสมชาย ใจดี', 'นายวิชัย ทองดี', 'นายประสิทธิ์ แสงทอง', 'นายมานะ รักษ์ดี',
  'นายสุรชัย บุญมา', 'นายอนันต์ ศรีสวัสดิ์', 'นายธนา วงษ์ดี', 'นายพงษ์ศักดิ์ สุขใจ',
  'นายกิตติ ชัยมงคล', 'นายณัฐวุฒิ พรมดี', 'นายเอกชัย สิงห์ทอง', 'นายพิทักษ์ แก้วใจ',
  'นายสมศักดิ์ ดวงดี', 'นายวรวุฒิ มีสุข', 'นายชัยวัฒน์ พลอยงาม', 'นายปรีชา โชคดี',
  'นายสมพงษ์ แสนดี', 'นายวรพล ทรัพย์มาก', 'นายจีรศักดิ์ ภูมิดี', 'นายธีรพล สุขสันต์',
  'นางสาวมาลี ใจงาม', 'นางสาวสุภาพ รักสวย', 'นางรัตนา ทองมา', 'นางประนอม สุขดี',
  'นางสาวกาญจนา ดีเสมอ', 'นางสาวพิมพ์ ทองแดง', 'นางสมหวัง รุ่งเรือง', 'นางวาสนา ชัยดี',
  'นางสาวอรุณี ศิริ', 'นางเพ็ญศรี มั่งมี',
]

const SCHOOL_NAMES = [
  ['โรงเรียนบ้านหนองบัว', 'ศูนย์พัฒนาเด็กเล็ก ต.หนองบัว'],
  ['โรงเรียนชุมชนบ้านเหล่า', 'โรงเรียนบ้านท่าขี้เหล็ก'],
  ['โรงเรียนบ้านนาดีสามัคคี'],
  ['โรงเรียนคลองสามวิทยา', 'ศูนย์การเรียนชุมชน'],
  ['โรงเรียนบ้านแม่กา'],
  ['โรงเรียนบ้านดอนแก้ว', 'โรงเรียนขอนแก่นราษฎร์'],
  ['โรงเรียนบ้านควนขนุน'],
  ['โรงเรียนสันกำแพง', 'โรงเรียนบ้านต้นเหียง', 'ศูนย์พัฒนาเด็กเล็ก'],
  ['โรงเรียนบ้านโนนสวรรค์'],
  ['โรงเรียนบ้านน้ำพุ', 'โรงเรียนวัดน้ำพุ'],
]

const TEMPLE_NAMES = [
  ['วัดหนองบัว'], ['วัดท่าขี้เหล็ก'], ['วัดนาดี'],
  ['วัดคลองสาม'], ['วัดแม่กา'], ['วัดดอนแก้ว'],
  ['วัดควนขนุน', 'มัสยิดชุมชน'], ['วัดสันกำแพง'],
  ['วัดโนนสวรรค์'], ['วัดน้ำพุ'],
]

const SHOP_NAMES_LIST = [
  ['ร้านค้าชุมชนหนองบัว', 'ร้านสหกรณ์', 'ร้านนายสมชาย'],
  ['ร้านท่าขี้เหล็กพาณิชย์', 'ร้านนายวิชัย'],
  ['ร้านนาดีการค้า', 'ร้านชุมชนนาดี'],
  ['ร้านคลองสามมาร์ท', 'ร้านสหกรณ์ชุมชน', 'ร้านนายอนันต์'],
  ['ร้านแม่กาสโตร์'],
  ['ร้านดอนแก้วพาณิชย์', 'ร้านนางรัตนา'],
  ['ร้านควนขนุนค้าส่ง', 'ร้านนายสุรชัย'],
  ['ร้านสันกำแพงมาร์ท', 'ร้านสหกรณ์สันกำแพง', 'ร้านนายมานะ'],
  ['ร้านโนนสวรรค์การค้า'],
  ['ร้านน้ำพุพาณิชย์', 'ร้านสหกรณ์น้ำพุ'],
]

// ── village definitions ────────────────────────────────────────────────────────

const VILLAGES = [
  { name: 'หนองบัว',    no: '3',  tambon: 'หนองบัว',    amphoe: 'เมือง',      province: 'อุดรธานี',     zone: 'อีสานบน',  pop: 850,  actual: 760, hh: 195, coord: 'นายสมบัติ ใจดี',   phone: '0812345678', readiness: 'high'   },
  { name: 'ท่าขี้เหล็ก', no: '7', tambon: 'ท่าขี้เหล็ก', amphoe: 'เมือง',     province: 'เชียงราย',     zone: 'เหนือบน',  pop: 620,  actual: 580, hh: 148, coord: 'นายวิชัย ทองดี',  phone: '0823456789', readiness: 'medium' },
  { name: 'นาดี',        no: '5',  tambon: 'นาดี',        amphoe: 'โนนสูง',    province: 'นครราชสีมา',  zone: 'อีสานล่าง', pop: 780,  actual: 720, hh: 182, coord: 'นายประสิทธิ์ แสงทอง', phone: '0834567890', readiness: 'high'   },
  { name: 'คลองสาม',    no: '2',  tambon: 'คลองสาม',    amphoe: 'คลองหลวง', province: 'ปทุมธานี',    zone: 'กลาง',     pop: 920,  actual: 850, hh: 218, coord: 'นางสาวมาลี ใจงาม', phone: '0845678901', readiness: 'medium' },
  { name: 'แม่กา',       no: '4',  tambon: 'แม่กา',       amphoe: 'เมือง',     province: 'พะเยา',        zone: 'เหนือบน',  pop: 540,  actual: 490, hh: 125, coord: 'นายสุรชัย บุญมา',  phone: '0856789012', readiness: 'low'    },
  { name: 'ดอนแก้ว',    no: '6',  tambon: 'ดอนแก้ว',    amphoe: 'เมือง',     province: 'ขอนแก่น',     zone: 'อีสานบน',  pop: 710,  actual: 660, hh: 170, coord: 'นายอนันต์ ศรีสวัสดิ์', phone: '0867890123', readiness: 'high'   },
  { name: 'ควนขนุน',    no: '8',  tambon: 'ควนขนุน',    amphoe: 'ควนขนุน',  province: 'พัทลุง',       zone: 'ใต้บน',    pop: 660,  actual: 610, hh: 158, coord: 'นายธนา วงษ์ดี',    phone: '0878901234', readiness: 'medium' },
  { name: 'สันกำแพง',   no: '1',  tambon: 'สันกำแพง',   amphoe: 'สันกำแพง', province: 'เชียงใหม่',   zone: 'เหนือบน',  pop: 830,  actual: 780, hh: 200, coord: 'นางสาวสุภาพ รักสวย', phone: '0889012345', readiness: 'high'   },
  { name: 'โนนสวรรค์',  no: '9',  tambon: 'โนนสวรรค์',  amphoe: 'เมือง',     province: 'บุรีรัมย์',    zone: 'อีสานล่าง', pop: 590,  actual: 540, hh: 138, coord: 'นายพงษ์ศักดิ์ สุขใจ', phone: '0890123456', readiness: 'low'    },
  { name: 'น้ำพุ',       no: '11', tambon: 'น้ำพุ',       amphoe: 'เมือง',     province: 'กาญจนบุรี',   zone: 'ตะวันตก',  pop: 740,  actual: 680, hh: 175, coord: 'นางวาสนา ชัยดี',   phone: '0901234567', readiness: 'medium' },
]

const COVERAGE = { high: 0.75, medium: 0.58, low: 0.40 }

// ── main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding 10 test villages...\n')

  for (let vi = 0; vi < VILLAGES.length; vi++) {
    const vd = VILLAGES[vi]
    const idx = vi // 0-based index for arrays
    const isHigh   = vd.readiness === 'high'
    const isMedium = vd.readiness === 'medium'
    const coverage = COVERAGE[vd.readiness as keyof typeof COVERAGE]

    // ── Create village ──────────────────────────────────────────────────────
    const village = await prisma.village.create({
      data: {
        villageName: vd.name, villageNo: vd.no,
        tambon: vd.tambon, amphoe: vd.amphoe, province: vd.province, zone: vd.zone,
        registeredPopulation: vd.pop, actualPopulation: vd.actual, householdCount: vd.hh,
        coordinator: vd.coord, phone: vd.phone,
      },
    })

    // ── Screening result ────────────────────────────────────────────────────
    const screenedCount = Math.round(vd.actual * coverage)
    const alcoholRiskLow = Math.round(screenedCount * rand(8, 15) / 100)
    const alcoholRisk    = Math.round(screenedCount * rand(5, 12) / 100)
    const alcoholDanger  = Math.round(screenedCount * rand(2, 8)  / 100)
    const alcoholAddicted = Math.round(screenedCount * rand(1, 4) / 100)
    const alcoholNone    = Math.max(0, screenedCount - alcoholRiskLow - alcoholRisk - alcoholDanger - alcoholAddicted)
    const tobaccoCount   = Math.round(screenedCount * rand(15, 28) / 100)
    const tobaccoNone    = screenedCount - tobaccoCount
    const drinkAndDrive  = Math.round(screenedCount * rand(4, 10) / 100)
    const drinkNotDriveN = Math.round(screenedCount * rand(10, 20) / 100)

    await prisma.screeningResult.create({
      data: {
        villageId: village.id, year: 1,
        screenedCount, alcoholRiskLow, alcoholRisk, alcoholDanger, alcoholAddicted, alcoholNone,
        tobaccoCount, tobaccoNone, drinkAndDrive, drinkNotDriveN,
      },
    })

    // ── Community Background ────────────────────────────────────────────────
    const bgItems = ['communityCalendar', 'riskLocation', 'participationPolicy', 'capacityPolicy', 'communityHistory']
    const bgHasCount = isHigh ? 5 : isMedium ? rand(3, 4) : rand(1, 2)
    for (let i = 0; i < bgItems.length; i++) {
      await prisma.communityBackground.create({
        data: { villageId: village.id, itemType: bgItems[i], hasItem: i < bgHasCount },
      })
    }

    // ── Env Items ───────────────────────────────────────────────────────────
    const hasFuneral   = isHigh || (isMedium && bool(0.7)) || bool(0.3)
    const hasTradition = isHigh || (isMedium && bool(0.6)) || bool(0.2)
    const hasShop      = isHigh || (isMedium && bool(0.8)) || bool(0.4)
    const hasNoDrink   = isHigh || bool(0.5)

    await prisma.envItem.create({
      data: {
        villageId: village.id, itemType: 'funeral', hasItem: hasFuneral,
        hasPolicy:        hasFuneral && (isHigh || bool(0.6)),
        hasCommunityRule: hasFuneral && (isHigh || bool(0.5)),
        result1: hasFuneral ? `จัดงานศพปลอดเหล้า ${rand(2, 8)} งาน` : null,
        result2: hasFuneral ? `ขยายผล ครอบคลุม ${rand(60, 90)}% ของงานศพ` : null,
        result3: hasFuneral ? `เป็นมาตรฐานชุมชน ทุกงานศพปลอดเหล้า` : null,
      },
    })
    await prisma.envItem.create({
      data: {
        villageId: village.id, itemType: 'tradition', hasItem: hasTradition,
        result1: hasTradition ? `งานบุญประเพณีปลอดเหล้า ${rand(3, 6)} งาน` : null,
        result2: hasTradition ? `ชุมชนให้ความร่วมมือดี` : null,
        result3: hasTradition ? `ต่อเนื่องทุกปี` : null,
      },
    })
    await prisma.envItem.create({
      data: {
        villageId: village.id, itemType: 'shop', hasItem: hasShop,
        noAlcohol:    hasShop && (isHigh || bool(0.5)),
        shopNames:    hasShop ? JSON.stringify(names(SHOP_NAMES_LIST[idx], 1, isHigh ? 3 : 2)) : null,
        hasShopLegal: hasShop && (isHigh || bool(0.6)),
        shopLegalNames: hasShop && (isHigh || bool(0.6))
          ? JSON.stringify(names(SHOP_NAMES_LIST[idx], 1, 2)) : null,
        result1: hasShop ? `ร้านค้าเข้าร่วม ${rand(2, 5)} ร้าน` : null,
        result2: hasShop ? `ปฏิบัติตามกฎหมายอย่างต่อเนื่อง` : null,
        result3: hasShop ? `ไม่พบการขายเหล้าเกินเวลา` : null,
      },
    })
    await prisma.envItem.create({
      data: {
        villageId: village.id, itemType: 'nodrinkzone', hasItem: hasNoDrink,
        result1: hasNoDrink ? `กำหนด ${rand(3, 8)} จุด ในชุมชน` : null,
        result2: hasNoDrink ? `มีป้ายประกาศครบทุกจุด` : null,
        result3: hasNoDrink ? `ลดการดื่มในที่สาธารณะได้ ${rand(40, 80)}%` : null,
      },
    })

    // ── Community Orgs ──────────────────────────────────────────────────────
    const orgDefs = [
      { key: 'school',       names: SCHOOL_NAMES[idx],  prob: isHigh ? 1 : isMedium ? 0.8 : 0.5, r1: `ร่วมกิจกรรม ${rand(2,6)} ครั้ง` },
      { key: 'temple',       names: TEMPLE_NAMES[idx],  prob: isHigh ? 0.9 : isMedium ? 0.7 : 0.4, r1: `สนับสนุนงานบุญปลอดเหล้า ${rand(2,5)} งาน` },
      { key: 'localAdmin',   names: [`อบต.${vd.tambon}`], prob: isHigh ? 1 : isMedium ? 0.9 : 0.6, r1: `สนับสนุนงบประมาณ ${rand(10,50) * 1000} บาท` },
      { key: 'villageAdmin', names: [`กำนันตำบล${vd.tambon}`, `ผู้ใหญ่บ้าน ม.${vd.no}`], prob: isHigh ? 1 : 0.9, r1: `นำชุมชนเข้าร่วมโครงการ` },
      { key: 'hospital',     names: [`รพ.สต.${vd.tambon}`], prob: isHigh ? 0.9 : isMedium ? 0.7 : 0.5, r1: `ให้ความรู้สุขภาพ ${rand(3,8)} ครั้ง` },
      { key: 'orgGroup',     names: names([`กลุ่มอาสาสมัคร ม.${vd.no}`, `กลุ่มสตรี${vd.tambon}`, `กลุ่มผู้สูงอายุ`, `กลุ่มเยาวชน`], 1, 3),
                                           prob: isHigh ? 0.9 : isMedium ? 0.6 : 0.3, r1: `รณรงค์ในชุมชน ${rand(4,10)} ครั้ง` },
    ]

    for (const org of orgDefs) {
      const has = bool(org.prob)
      await prisma.communityOrg.create({
        data: {
          villageId: village.id, orgType: org.key,
          hasParticipation: has,
          orgNames: has ? JSON.stringify(org.names) : null,
          result1: has ? org.r1 : null,
          result2: has ? `ต่อเนื่องปีที่ 2 ขยายผลเพิ่ม` : null,
          result3: has ? `เป็นแกนนำชุมชน` : null,
        },
      })
    }

    // ── Persons ─────────────────────────────────────────────────────────────
    const personCount = isHigh ? rand(18, 25) : isMedium ? rand(12, 18) : rand(10, 14)
    const usedNames = new Set<string>()
    const shuffledNames = [...PERSON_NAMES].sort(() => Math.random() - 0.5)

    for (let pi = 0; pi < personCount; pi++) {
      const pName = shuffledNames[pi % shuffledNames.length] +
        (pi >= shuffledNames.length ? ` ${pi + 1}` : '')
      if (usedNames.has(pName)) continue
      usedNames.add(pName)

      const gender   = bool(0.7) ? 'ชาย' : 'หญิง'
      const hasAlc   = bool(0.75)
      const hasTob   = bool(0.50)
      const hasDnd   = bool(0.40)

      const person = await prisma.person.create({
        data: { villageId: village.id, name: pName, gender },
      })

      // Alcohol
      if (hasAlc) {
        const drinkType = pick(DRINK_TYPES)
        const statusY1 = pick(ALC_STATUS_Y1)
        const hasY2 = bool(0.70)
        const hasY3 = hasY2 && bool(0.65)

        // Outcomes Y1
        const alcOutcome: Record<string, boolean> = {
          y1Money: bool(0.4), y1Health: bool(0.6), y1Family: bool(0.5),
          y1Work: bool(0.3), y1Accepted: bool(0.4), y1Property: bool(0.2), y1Other: bool(0.2),
        }
        const alcOutcome2: Record<string, boolean> = hasY2 ? {
          y2Money: bool(0.5), y2Health: bool(0.7), y2Family: bool(0.6),
          y2Work: bool(0.4), y2Accepted: bool(0.5), y2Property: bool(0.3), y2Other: bool(0.2),
        } : {}
        const alcOutcome3: Record<string, boolean> = hasY3 ? {
          y3Money: bool(0.6), y3Health: bool(0.8), y3Family: bool(0.7),
          y3Work: bool(0.5), y3Accepted: bool(0.6), y3Property: bool(0.4), y3Other: bool(0.3),
        } : {}

        await prisma.personAlcohol.create({
          data: {
            personId: person.id, drinkType,
            statusY1,
            statusY2: hasY2 ? pick(ALC_STATUS_Y2) : null,
            statusY3: hasY3 ? pick(ALC_STATUS_Y3) : null,
            noteY1: `ให้คำปรึกษาครั้งที่ 1`,
            noteY2: hasY2 ? `ติดตามผล ปีที่ 2` : null,
            noteY3: hasY3 ? `ติดตามผล ปีที่ 3` : null,
            ...alcOutcome, ...alcOutcome2, ...alcOutcome3,
          },
        })
      }

      // Tobacco
      if (hasTob) {
        const smokeType = pick(SMOKE_TYPES)
        const statusY1  = pick(TOB_STATUS_Y1)
        const hasY2     = bool(0.65)
        const hasY3     = hasY2 && bool(0.60)
        const tobOutcome: Record<string, boolean> = {
          y1Health: bool(0.7), y1Money: bool(0.4), y1Family: bool(0.5),
          y1Work: bool(0.3), y1Accepted: bool(0.4), y1Property: bool(0.2), y1Other: bool(0.2),
        }
        const tobOutcome2: Record<string, boolean> = hasY2 ? {
          y2Health: bool(0.75), y2Money: bool(0.5), y2Family: bool(0.55),
        } : {}
        const tobOutcome3: Record<string, boolean> = hasY3 ? {
          y3Health: bool(0.8), y3Money: bool(0.6), y3Family: bool(0.65),
        } : {}

        await prisma.personTobacco.create({
          data: {
            personId: person.id, smokeType,
            statusY1,
            statusY2: hasY2 ? pick(TOB_STATUS_Y2) : null,
            statusY3: hasY3 ? pick(TOB_STATUS_Y3) : null,
            noteY1: `ให้คำแนะนำเลิกสูบบุหรี่`,
            noteY2: hasY2 ? `ติดตามผล ปีที่ 2` : null,
            noteY3: hasY3 ? `ติดตามผล ปีที่ 3` : null,
            ...tobOutcome, ...tobOutcome2, ...tobOutcome3,
          },
        })
      }

      // DND
      if (hasDnd) {
        const drinkType  = pick(DND_DRINK_TYPES)
        const hasY2      = bool(0.65)
        const hasY3      = hasY2 && bool(0.60)
        await prisma.personDnd.create({
          data: {
            personId: person.id, drinkType,
            year1Result: pick(DND_RESULT_Y1),
            year2Result: hasY2 ? pick(DND_RESULT_Y2) : null,
            year3Result: hasY3 ? pick(DND_RESULT_Y3) : null,
          },
        })
      }
    }

    const typeLabel = isHigh ? '⭐ สูง' : isMedium ? '◎ กลาง' : '○ ต่ำ'
    console.log(`  ✅ บ้าน${vd.name} (${vd.zone}) — คัดกรอง ${screenedCount}/${vd.actual} คน, สมาชิก ${personCount} คน [${typeLabel}]`)
  }

  // Summary
  const total = await prisma.village.count()
  const persons = await prisma.person.count()
  const screening = await prisma.screeningResult.aggregate({ _sum: { screenedCount: true } })
  console.log(`\n✨ Done! Villages: ${total}, Persons: ${persons}, Screened: ${screening._sum.screenedCount?.toLocaleString()}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
