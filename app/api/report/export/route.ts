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
      alcohol: true,
      tobacco: true,
      dnd:     true,
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
        const bk = `y${y}${k}`, tk = `y${y}${k}Text`, nk = `y${y}${k}Note`
        const checked = alc?.[bk] || tob?.[bk]
        const text    = (alc?.[tk] ?? tob?.[tk] ?? '') as string
        const note    = (alc?.[nk] ?? tob?.[nk] ?? '') as string
        return [checked ? (text || '✓') : '', note]
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
