import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q         = searchParams.get('q')         ?? ''
  const province  = searchParams.get('province')  ?? ''
  const amphoe    = searchParams.get('amphoe')    ?? ''
  const villageId = searchParams.get('villageId') ?? ''
  const group     = searchParams.get('group')     ?? ''
  const tab       = searchParams.get('tab')       ?? ''

  // ── Village export ───────────────────────────────────────────────────────────
  if (tab === 'villages') {
    const where = {
      ...(province  ? { province }            : {}),
      ...(amphoe    ? { amphoe }              : {}),
      ...(villageId ? { id: Number(villageId) } : {}),
    }
    const villages = await prisma.village.findMany({
      where,
      orderBy: [{ zone: 'asc' }, { province: 'asc' }, { villageName: 'asc' }],
      include: {
        screeningResults: { take: 1, orderBy: { year: 'desc' } },
        communityBackgrounds: true,
        envItems: true,
        communityOrgs: true,
        _count: { select: { persons: true } },
      },
    })

    const headers = [
      'หมู่บ้าน', 'หมู่ที่', 'ตำบล', 'อำเภอ', 'จังหวัด', 'ภาค',
      'ประชากรทะเบียนบ้าน', 'ประชากรจริง', 'จำนวนสมาชิก',
      'คัดกรอง', 'เหล้า%', 'บุหรี่%', 'ขับเมา%',
      'ปฏิทินชุมชน', 'สถานที่เสี่ยง', 'นโยบายมีส่วนร่วม', 'นโยบายพัฒนา', 'ประวัติชุมชน',
      'งานศพปลอดเหล้า', 'นโยบายงานศพ', 'กติกาชุมชน',
      'งานประเพณี', 'ประเพณีปลอดเหล้า',
      'ร้านค้าเข้าร่วม', 'ไม่ขายเหล้า', 'สถานที่ห้ามดื่ม', 'ห้ามดื่มห้ามขาย',
      'สถานศึกษา', 'วัด', 'อบต.', 'กำนัน', 'รพ.สต.', 'กลุ่มองค์กร',
    ]

    const rows = villages.map((v) => {
      const s   = v.screeningResults[0]
      const sc  = s?.screenedCount ?? 0
      const bm  = Object.fromEntries(v.communityBackgrounds.map(b => [b.itemType, b]))
      const em  = Object.fromEntries(v.envItems.map(e => [e.itemType, e]))
      const om  = Object.fromEntries(v.communityOrgs.map(o => [o.orgType, o]))
      const pct = (n: number) => sc > 0 ? `${Math.round((n / sc) * 100)}%` : ''
      const yn  = (b: boolean | null | undefined) => b ? 'มี' : ''
      return [
        `บ้าน${v.villageName}`, v.villageNo, v.tambon, v.amphoe, v.province, v.zone,
        v.registeredPopulation, v.actualPopulation, v._count.persons,
        sc || '', s ? pct(s.alcoholRiskLow + s.alcoholRisk + s.alcoholDanger + s.alcoholAddicted) : '',
        s ? pct(s.tobaccoCount) : '', s ? pct(s.drinkAndDrive) : '',
        yn(bm.communityCalendar?.hasItem), yn(bm.riskLocation?.hasItem),
        yn(bm.participationPolicy?.hasItem), yn(bm.capacityPolicy?.hasItem), yn(bm.communityHistory?.hasItem),
        yn(em.funeral?.hasItem), yn(em.funeral?.hasPolicy), yn(em.funeral?.hasCommunityRule),
        yn(em.tradition?.hasItem), yn((em.tradition as any)?.hasTraditionEvent),
        yn(em.shop?.hasItem), yn(em.shop?.noAlcohol),
        yn((em.nodrinkzone as any)?.hasNoDrinkSite), yn(em.nodrinkzone?.hasItem),
        yn(om.school?.hasParticipation), yn(om.temple?.hasParticipation),
        yn(om.localAdmin?.hasParticipation), yn(om.villageAdmin?.hasParticipation),
        yn(om.hospital?.hasParticipation), yn(om.orgGroup?.hasParticipation),
      ]
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [
      { wch: 18 }, { wch: 6 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 20 },
      { wch: 12 }, { wch: 12 }, { wch: 10 },
      ...Array(headers.length - 9).fill({ wch: 12 }),
    ]
    ws['!freeze'] = { xSplit: 1, ySplit: 1 }
    XLSX.utils.book_append_sheet(wb, ws, 'หมู่บ้าน')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="conmunity-villages-${new Date().toISOString().slice(0,10)}.xlsx"`,
      },
    })
  }

  const where = {
    AND: [
      q ? { OR: [{ name: { contains: q } }, { village: { villageName: { contains: q } } }] } : {},
      province  ? { village: { province } }        : {},
      amphoe    ? { village: { amphoe } }          : {},
      villageId ? { villageId: Number(villageId) } : {},
      group === 'alcohol' ? { alcohol: { isNot: null } } : {},
      group === 'tobacco' ? { tobacco: { isNot: null } } : {},
      group === 'dnd'     ? { dnd:     { isNot: null } } : {},
    ],
  }

  const persons = await prisma.person.findMany({
    where,
    include: {
      village: { select: { villageName: true, villageNo: true, tambon: true, amphoe: true, province: true, zone: true } },
      alcohol: true, tobacco: true, dnd: true, outcomes: true,
    },
    orderBy: [{ village: { province: 'asc' } }, { village: { villageName: 'asc' } }, { name: 'asc' }],
  })

  const OUTCOMES = ['Money','Property','Family','Health','Work','Accepted','Other']
  const OUTCOME_TH: Record<string,string> = {
    Money:'เงินประหยัด', Property:'ทรัพย์สิน', Family:'ครอบครัว',
    Health:'สุขภาพ', Work:'อาชีพ', Accepted:'ยอมรับ', Other:'อื่นๆ',
  }

  const outcomeHeaders = OUTCOMES.flatMap((k) =>
    [1,2,3].flatMap((y) => [`ผลลัพธ์-${OUTCOME_TH[k]}-ปี${y}`, `ผลลัพธ์-${OUTCOME_TH[k]}-ปี${y}-หมายเหตุ`])
  )

  const headers = [
    'ชื่อ-สกุล',
    'หมู่บ้าน', 'หมู่ที่', 'ตำบล', 'อำเภอ', 'จังหวัด', 'ภาค',
    'เหล้า-ประเภท', 'เหล้า-ปี1', 'เหล้า-ปี2', 'เหล้า-ปี3',
    'บุหรี่-ประเภท', 'บุหรี่-ปี1', 'บุหรี่-ปี2', 'บุหรี่-ปี3',
    'ดื่มไม่ขับ-ประเภท', 'ดื่มไม่ขับ-ปี1', 'ดื่มไม่ขับ-ปี2', 'ดื่มไม่ขับ-ปี3',
    ...outcomeHeaders,
  ]

  const rows = persons.map((p) => {
    const alc = p.alcohol as Record<string,unknown> | null
    const tob = p.tobacco as Record<string,unknown> | null
    const dnd = p.dnd

    const outcomeVals = OUTCOMES.flatMap((k) =>
      [1,2,3].flatMap((y) => {
        const outcome = (p as any).outcomes?.find((o: any) => o.year === y && o.outcomeType === k && o.hasIt)
        return [outcome ? (outcome.detail || '✓') : '', outcome?.moneyNote ?? '']
      })
    )

    return [
      p.name,
      `บ้าน${p.village.villageName}`, p.village.villageNo, p.village.tambon, p.village.amphoe, p.village.province, p.village.zone,
      alc?.drinkType ?? '', alc?.statusY1 ?? '', alc?.statusY2 ?? '', alc?.statusY3 ?? '',
      tob?.smokeType ?? '', tob?.statusY1 ?? '', tob?.statusY2 ?? '', tob?.statusY3 ?? '',
      dnd?.drinkType  ?? '', dnd?.year1Result ?? '', dnd?.year2Result ?? '', dnd?.year3Result ?? '',
      ...outcomeVals,
    ]
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // column widths
  ws['!cols'] = [
    { wch: 20 }, // ชื่อ
    { wch: 18 }, { wch: 6 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, // village
    { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 28 }, // alcohol
    { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 28 }, // tobacco
    { wch: 30 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, // dnd
    ...Array(outcomeHeaders.length).fill({ wch: 18 }),
  ]

  // freeze first row + first col
  ws['!freeze'] = { xSplit: 1, ySplit: 1 }

  XLSX.utils.book_append_sheet(wb, ws, 'สมาชิก')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="conmunity-report-${new Date().toISOString().slice(0,10)}.xlsx"`,
    },
  })
}
