import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import * as XLSX from 'xlsx'

type TrackRow = { villageId: number; total: bigint; y1: bigint; y2: bigint; y3: bigint }
type TypeRow  = { villageId: number; typeName: string; cnt: bigint }
type ScreenRow = { villageId: number; screenedCount: bigint }

const AL_TYPES  = ['ดื่มนานๆ ครั้ง', 'เสี่ยงต่ำ', 'เสี่ยง', 'อันตราย', 'ติด', 'กำลังบำบัด']
const TB_TYPES  = ['สูบประจำ', 'สูบนานๆ ครั้ง', 'เพิ่งเลิก', 'ไม่สูบ']
const DND_TYPES = ['ดื่มแล้วขับ', 'ดื่มไม่ขับ', 'ใช้บริการรับส่ง', 'ไม่ดื่ม']

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const zone     = sp.get('zone')     || undefined
  const province = sp.get('province') || undefined
  const amphoe   = sp.get('amphoe')   || undefined
  const tambon   = sp.get('tambon')   || undefined
  const q        = sp.get('q')        || undefined

  const where: Prisma.VillageWhereInput = {}
  if (zone)     where.zone     = zone
  if (province) where.province = province
  if (amphoe)   where.amphoe   = amphoe
  if (tambon)   where.tambon   = tambon
  if (q) {
    where.OR = [
      { villageName: { contains: q } },
      { tambon:      { contains: q } },
      { amphoe:      { contains: q } },
      { province:    { contains: q } },
    ]
  }

  const villages = await prisma.village.findMany({
    where,
    orderBy: [{ zone: 'asc' }, { province: 'asc' }, { amphoe: 'asc' }],
  })

  const ids = villages.map(v => v.id)
  if (ids.length === 0) {
    return new NextResponse('ไม่พบข้อมูล', { status: 404 })
  }

  const idList = Prisma.join(ids)

  const [alcoholTrackRaw, tobaccoTrackRaw, dndTrackRaw, screenRaw,
         alcoholTypes, tobaccoTypes, dndTypes] = await Promise.all([

    prisma.$queryRaw<TrackRow[]>`
      SELECT villageId,
        COUNT(*) AS total,
        SUM(IF(y1Money OR y1Property OR y1Family OR y1Health OR y1Work OR y1Accepted OR y1Other,1,0)) AS y1,
        SUM(IF(y2Money OR y2Property OR y2Family OR y2Health OR y2Work OR y2Accepted OR y2Other,1,0)) AS y2,
        SUM(IF(y3Money OR y3Property OR y3Family OR y3Health OR y3Work OR y3Accepted OR y3Other,1,0)) AS y3
      FROM AlcoholMember WHERE villageId IN (${idList}) GROUP BY villageId`,

    prisma.$queryRaw<TrackRow[]>`
      SELECT villageId,
        COUNT(*) AS total,
        SUM(IF(y1Money OR y1Property OR y1Family OR y1Health OR y1Work OR y1Accepted OR y1Other,1,0)) AS y1,
        SUM(IF(y2Money OR y2Property OR y2Family OR y2Health OR y2Work OR y2Accepted OR y2Other,1,0)) AS y2,
        SUM(IF(y3Money OR y3Property OR y3Family OR y3Health OR y3Work OR y3Accepted OR y3Other,1,0)) AS y3
      FROM TobaccoMember WHERE villageId IN (${idList}) GROUP BY villageId`,

    prisma.$queryRaw<TrackRow[]>`
      SELECT villageId,
        COUNT(*) AS total,
        SUM(IF(year1Result IS NOT NULL AND year1Result!='',1,0)) AS y1,
        SUM(IF(year2Result IS NOT NULL AND year2Result!='',1,0)) AS y2,
        SUM(IF(year3Result IS NOT NULL AND year3Result!='',1,0)) AS y3
      FROM DrinkNotDriveMember WHERE villageId IN (${idList}) GROUP BY villageId`,

    prisma.$queryRaw<ScreenRow[]>`
      SELECT villageId, screenedCount FROM ScreeningResult
      WHERE year = 1 AND villageId IN (${idList})`,

    prisma.$queryRaw<TypeRow[]>`
      SELECT villageId, drinkType AS typeName, COUNT(*) AS cnt
      FROM AlcoholMember WHERE villageId IN (${idList}) GROUP BY villageId, drinkType`,

    prisma.$queryRaw<TypeRow[]>`
      SELECT villageId, smokeType AS typeName, COUNT(*) AS cnt
      FROM TobaccoMember WHERE villageId IN (${idList}) GROUP BY villageId, smokeType`,

    prisma.$queryRaw<TypeRow[]>`
      SELECT villageId, drinkType AS typeName, COUNT(*) AS cnt
      FROM DrinkNotDriveMember WHERE villageId IN (${idList}) GROUP BY villageId, drinkType`,
  ])

  // build lookup maps
  const toTrack = (rows: TrackRow[]) =>
    Object.fromEntries(rows.map(r => [r.villageId, {
      total: Number(r.total), y1: Number(r.y1), y2: Number(r.y2), y3: Number(r.y3),
    }]))

  const toType = (rows: TypeRow[]) => {
    const m: Record<number, Record<string, number>> = {}
    for (const r of rows) {
      if (!m[r.villageId]) m[r.villageId] = {}
      m[r.villageId][r.typeName] = Number(r.cnt)
    }
    return m
  }

  const alTrack  = toTrack(alcoholTrackRaw)
  const tbTrack  = toTrack(tobaccoTrackRaw)
  const dndTrack = toTrack(dndTrackRaw)
  const screens  = Object.fromEntries(screenRaw.map(r => [r.villageId, Number(r.screenedCount)]))
  const alType   = toType(alcoholTypes)
  const tbType   = toType(tobaccoTypes)
  const dndType  = toType(dndTypes)

  const rows = villages.map((v, i) => {
    const al  = alTrack[v.id]  ?? { total: 0, y1: 0, y2: 0, y3: 0 }
    const tb  = tbTrack[v.id]  ?? { total: 0, y1: 0, y2: 0, y3: 0 }
    const dnd = dndTrack[v.id] ?? { total: 0, y1: 0, y2: 0, y3: 0 }
    const sc  = screens[v.id]  ?? 0
    const alT = alType[v.id]   ?? {}
    const tbT = tbType[v.id]   ?? {}
    const dT  = dndType[v.id]  ?? {}

    const row: Record<string, string | number> = {
      'ลำดับ':             i + 1,
      'ชื่อหมู่บ้าน':      `บ้าน${v.villageName}`,
      'หมู่ที่':            v.villageNo,
      'ตำบล':              v.tambon,
      'อำเภอ':             v.amphoe,
      'จังหวัด':           v.province,
      'ภาค':               v.zone,
      'ประชากร (ทะเบียน)': v.registeredPopulation,
      'ประชากร (จริง)':    v.actualPopulation,
      'จำนวนครัวเรือน':   v.householdCount,
      'คัดกรอง':           Number(sc),
      'ผู้ประสานงาน':      v.coordinator,
      'เบอร์โทรศัพท์':    v.phone ?? '',
      // งดเหล้า — ติดตาม
      'งดเหล้า รวม':      al.total,
      'งดเหล้า ปี 1':     al.y1,
      'งดเหล้า ปี 2':     al.y2,
      'งดเหล้า ปี 3':     al.y3,
    }
    // งดเหล้า — แจกแจงประเภท
    for (const t of AL_TYPES) row[`งดเหล้า: ${t}`] = alT[t] ?? 0
    // งดบุหรี่ — ติดตาม
    row['งดบุหรี่ รวม'] = tb.total
    row['งดบุหรี่ ปี 1'] = tb.y1
    row['งดบุหรี่ ปี 2'] = tb.y2
    row['งดบุหรี่ ปี 3'] = tb.y3
    // งดบุหรี่ — แจกแจงประเภท
    for (const t of TB_TYPES) row[`งดบุหรี่: ${t}`] = tbT[t] ?? 0
    // ดื่มไม่ขับ — ติดตาม
    row['ดื่มไม่ขับ รวม'] = dnd.total
    row['ดื่มไม่ขับ ปี 1'] = dnd.y1
    row['ดื่มไม่ขับ ปี 2'] = dnd.y2
    row['ดื่มไม่ขับ ปี 3'] = dnd.y3
    // ดื่มไม่ขับ — แจกแจงประเภท
    for (const t of DND_TYPES) row[`ดื่มไม่ขับ: ${t}`] = dT[t] ?? 0

    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  { wch: 22 }, { wch: 8 },  { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 18 }, { wch: 14 },
    // งดเหล้า track
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    // งดเหล้า types
    ...AL_TYPES.map(() => ({ wch: 14 })),
    // งดบุหรี่ track
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    // งดบุหรี่ types
    ...TB_TYPES.map(() => ({ wch: 14 })),
    // ดื่มไม่ขับ track
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    // ดื่มไม่ขับ types
    ...DND_TYPES.map(() => ({ wch: 14 })),
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลหมู่บ้าน')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const label = [zone, province, amphoe, tambon].filter(Boolean).join('_') || 'ทั้งหมด'
  const filename = encodeURIComponent(`ข้อมูลหมู่บ้าน_${label}.xlsx`)

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
