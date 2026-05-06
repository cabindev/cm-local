import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { getFilterOptions } from '@/app/actions/village'
import { TableFilters } from './TableFilters'
import { FileDown } from 'lucide-react'

export const metadata = { title: 'ตารางข้อมูล | Conmunity' }

type TrackRow  = { villageId: number; total: bigint; y1: bigint; y2: bigint; y3: bigint }
type TypeRow   = { villageId: number; typeName: string; cnt: bigint }
type ScreenRow = { villageId: number; screenedCount: bigint }

const AL_TYPES  = ['ดื่มนานๆ ครั้ง', 'เสี่ยงต่ำ', 'เสี่ยง', 'อันตราย', 'ติด', 'กำลังบำบัด']
const TB_TYPES  = ['สูบประจำ', 'สูบนานๆ ครั้ง', 'เพิ่งเลิก', 'ไม่สูบ']
const DND_TYPES = ['ดื่มแล้วขับ', 'ดื่มไม่ขับ', 'ใช้บริการรับส่ง', 'ไม่ดื่ม']

export default async function TablePage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string; province?: string; amphoe?: string; tambon?: string }>
}) {
  const { zone, province, amphoe, tambon } = await searchParams

  // สร้าง village WHERE
  const villageWhere: Prisma.VillageWhereInput = {}
  if (zone)     villageWhere.zone     = zone
  if (province) villageWhere.province = province
  if (amphoe)   villageWhere.amphoe   = amphoe
  if (tambon)   villageWhere.tambon   = tambon

  const [allVillages, filterOptions] = await Promise.all([
    prisma.village.findMany({
      where: villageWhere,
      orderBy: [{ zone: 'asc' }, { province: 'asc' }, { amphoe: 'asc' }],
    }),
    getFilterOptions(zone, province, amphoe),
  ])

  const ids = allVillages.map(v => v.id)

  // ถ้าไม่มีหมู่บ้าน ไม่ต้อง query ต่อ
  const emptyResult = ids.length === 0

  const idList = emptyResult ? Prisma.join([-1]) : Prisma.join(ids)

  const [alcoholTrack, tobaccoTrack, dndTrack, screenRaw,
         alcoholTypes, tobaccoTypes, dndTypes] = emptyResult
    ? [[], [], [], [], [], [], []]
    : await Promise.all([

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

  const toTrackMap = (rows: TrackRow[]) =>
    Object.fromEntries(rows.map(r => [r.villageId, {
      total: Number(r.total), y1: Number(r.y1), y2: Number(r.y2), y3: Number(r.y3),
    }]))

  const toTypeMap = (rows: TypeRow[]) => {
    const m: Record<number, Record<string, number>> = {}
    for (const r of rows) {
      if (!m[r.villageId]) m[r.villageId] = {}
      m[r.villageId][r.typeName] = Number(r.cnt)
    }
    return m
  }

  const alTrackMap  = toTrackMap(alcoholTrack as TrackRow[])
  const tbTrackMap  = toTrackMap(tobaccoTrack as TrackRow[])
  const dndTrackMap = toTrackMap(dndTrack as TrackRow[])
  const screenMap   = Object.fromEntries((screenRaw as ScreenRow[]).map(r => [r.villageId, Number(r.screenedCount)]))
  const alTypeMap   = toTypeMap(alcoholTypes as TypeRow[])
  const tbTypeMap   = toTypeMap(tobaccoTypes as TypeRow[])
  const dndTypeMap  = toTypeMap(dndTypes as TypeRow[])

  // export URL ตาม filter
  const exportParams = new URLSearchParams()
  if (zone)     exportParams.set('zone', zone)
  if (province) exportParams.set('province', province)
  if (amphoe)   exportParams.set('amphoe', amphoe)
  if (tambon)   exportParams.set('tambon', tambon)
  const exportUrl = `/api/villages/export${exportParams.size ? `?${exportParams}` : ''}`

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">ตารางข้อมูล</h1>
          <p className="text-xs text-gray-400 mt-0.5">รายละเอียดพร้อมผลติดตามและการแจกแจงตามประเภท</p>
        </div>
        <a href={exportUrl}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium rounded-lg transition-colors">
          <FileDown className="w-3.5 h-3.5" />
          Export{zone || province ? ' (ที่กรอง)' : ''}
        </a>
      </div>

      {/* Filters */}
      <TableFilters options={filterOptions} zone={zone} province={province} amphoe={amphoe} tambon={tambon} />

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-2.5 border-b border-gray-100 text-xs text-gray-400">
          แสดง <span className="font-semibold text-gray-700">{allVillages.length}</span> หมู่บ้าน
          {(zone || province || amphoe || tambon) && (
            <span className="ml-2 text-yellow-700">
              · {[zone, province, amphoe, tambon].filter(Boolean).join(' › ')}
            </span>
          )}
        </div>

        {allVillages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            ไม่พบข้อมูลตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs whitespace-nowrap border-collapse">
              <thead className="sticky top-0 z-10">

                <tr className="bg-gray-900 text-[11px] font-semibold">
                  <th colSpan={7}  className="px-3 py-2 text-left   text-gray-400  border-r border-gray-700">ข้อมูลหมู่บ้าน</th>
                  <th colSpan={4}  className="px-3 py-2 text-center text-gray-400  border-r border-gray-700">ประชากร</th>
                  <th colSpan={10} className="px-3 py-2 text-center text-yellow-400 border-r border-gray-700">งดเหล้า</th>
                  <th colSpan={8}  className="px-3 py-2 text-center text-yellow-300 border-r border-gray-700">งดบุหรี่</th>
                  <th colSpan={8}  className="px-3 py-2 text-center text-yellow-200">ดื่มไม่ขับ</th>
                </tr>

                <tr className="bg-gray-800 text-[10px] font-medium text-gray-500">
                  <th colSpan={7} className="border-r border-gray-700" />
                  <th colSpan={4} className="border-r border-gray-700" />
                  <th colSpan={4} className="px-3 py-1.5 text-center text-gray-400 border-r border-gray-700">ติดตามรายปี</th>
                  <th colSpan={6} className="px-3 py-1.5 text-center text-yellow-600 border-r border-gray-700">แจกแจงตามประเภท</th>
                  <th colSpan={4} className="px-3 py-1.5 text-center text-gray-400 border-r border-gray-700">ติดตามรายปี</th>
                  <th colSpan={4} className="px-3 py-1.5 text-center text-yellow-600 border-r border-gray-700">แจกแจงตามประเภท</th>
                  <th colSpan={4} className="px-3 py-1.5 text-center text-gray-400 border-r border-gray-700">ติดตามรายปี</th>
                  <th colSpan={4} className="px-3 py-1.5 text-center text-yellow-600">แจกแจงตามประเภท</th>
                </tr>

                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-400">
                  <th className="px-3 py-2 text-left w-8">#</th>
                  <th className="px-3 py-2 text-left min-w-[130px]">ชื่อ</th>
                  <th className="px-3 py-2 text-left min-w-[90px]">ตำบล</th>
                  <th className="px-3 py-2 text-left min-w-[100px]">อำเภอ</th>
                  <th className="px-3 py-2 text-left min-w-[110px]">จังหวัด</th>
                  <th className="px-3 py-2 text-left min-w-[80px]">ภาค</th>
                  <th className="px-3 py-2 text-left min-w-[130px] border-r border-gray-200">ผู้ประสานงาน</th>
                  <th className="px-3 py-2 text-right w-20">ทะเบียน</th>
                  <th className="px-3 py-2 text-right w-16">จริง</th>
                  <th className="px-3 py-2 text-right w-20">ครัวเรือน</th>
                  <th className="px-3 py-2 text-right w-20 border-r border-gray-200">คัดกรอง</th>
                  <th className="px-3 py-2 text-center w-14">รวม</th>
                  <th className="px-3 py-2 text-center w-14">ปี 1</th>
                  <th className="px-3 py-2 text-center w-14">ปี 2</th>
                  <th className="px-3 py-2 text-center w-14 border-r border-dashed border-gray-200">ปี 3</th>
                  {AL_TYPES.map((t, i) => (
                    <th key={t} className={`px-3 py-2 text-center min-w-[80px] ${i === AL_TYPES.length-1 ? 'border-r border-gray-200' : ''}`}>{t}</th>
                  ))}
                  <th className="px-3 py-2 text-center w-14">รวม</th>
                  <th className="px-3 py-2 text-center w-14">ปี 1</th>
                  <th className="px-3 py-2 text-center w-14">ปี 2</th>
                  <th className="px-3 py-2 text-center w-14 border-r border-dashed border-gray-200">ปี 3</th>
                  {TB_TYPES.map((t, i) => (
                    <th key={t} className={`px-3 py-2 text-center min-w-[90px] ${i === TB_TYPES.length-1 ? 'border-r border-gray-200' : ''}`}>{t}</th>
                  ))}
                  <th className="px-3 py-2 text-center w-14">รวม</th>
                  <th className="px-3 py-2 text-center w-14">ปี 1</th>
                  <th className="px-3 py-2 text-center w-14">ปี 2</th>
                  <th className="px-3 py-2 text-center w-14 border-r border-dashed border-gray-200">ปี 3</th>
                  {DND_TYPES.map((t) => (
                    <th key={t} className="px-3 py-2 text-center min-w-[100px]">{t}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {allVillages.map((v, i) => {
                  const al  = alTrackMap[v.id]  ?? { total: 0, y1: 0, y2: 0, y3: 0 }
                  const tb  = tbTrackMap[v.id]  ?? { total: 0, y1: 0, y2: 0, y3: 0 }
                  const dnd = dndTrackMap[v.id] ?? { total: 0, y1: 0, y2: 0, y3: 0 }
                  const sc  = screenMap[v.id] ?? 0
                  const alT = alTypeMap[v.id]  ?? {}
                  const tbT = tbTypeMap[v.id]  ?? {}
                  const dndT= dndTypeMap[v.id] ?? {}

                  return (
                    <tr key={v.id} className={`border-b border-gray-50 hover:bg-yellow-50 transition-colors ${i === allVillages.length-1 ? 'border-b-0' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-300">{i+1}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">บ้าน{v.villageName}</td>
                      <td className="px-3 py-2.5 text-gray-500">{v.tambon}</td>
                      <td className="px-3 py-2.5 text-gray-500">{v.amphoe}</td>
                      <td className="px-3 py-2.5 text-gray-500">{v.province}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px] font-medium">{v.zone}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 border-r border-gray-100">{v.coordinator}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">{v.registeredPopulation.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">{v.actualPopulation.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">{v.householdCount.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500 border-r border-gray-100">{sc > 0 ? sc.toLocaleString() : '—'}</td>
                      <TrackCells d={al} />
                      {AL_TYPES.map((t, i) => <TypeCell key={t} n={alT[t]??0} total={al.total} last={i===AL_TYPES.length-1} sep />)}
                      <TrackCells d={tb} />
                      {TB_TYPES.map((t, i) => <TypeCell key={t} n={tbT[t]??0} total={tb.total} last={i===TB_TYPES.length-1} sep />)}
                      <TrackCells d={dnd} />
                      {DND_TYPES.map((t) => <TypeCell key={t} n={dndT[t]??0} total={dnd.total} />)}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TrackCells({ d }: { d: { total: number; y1: number; y2: number; y3: number } }) {
  const pct = (n: number) => d.total > 0 ? Math.round((n / d.total) * 100) : 0
  return (
    <>
      <td className="px-3 py-2.5 text-center">
        {d.total > 0 ? <span className="font-semibold text-gray-800">{d.total}</span> : <span className="text-gray-200">—</span>}
      </td>
      {[d.y1, d.y2, d.y3].map((n, yi) => (
        <td key={yi} className={`px-3 py-2.5 text-center ${yi === 2 ? 'border-r border-dashed border-gray-200' : ''}`}>
          {d.total === 0 ? <span className="text-gray-200">—</span> : (
            <span className={`inline-flex flex-col items-center leading-none ${n === 0 ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">{n}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{pct(n)}%</span>
            </span>
          )}
        </td>
      ))}
    </>
  )
}

function TypeCell({ n, total, last, sep }: { n: number; total: number; last?: boolean; sep?: boolean }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0
  return (
    <td className={`px-3 py-2.5 text-center ${last && sep ? 'border-r border-gray-200' : ''}`}>
      {total === 0 ? <span className="text-gray-200">—</span> : n === 0 ? (
        <span className="text-gray-300">0</span>
      ) : (
        <span className="inline-flex flex-col items-center leading-none text-gray-700">
          <span className="font-semibold">{n}</span>
          <span className="text-[10px] text-gray-400 mt-0.5">{pct}%</span>
        </span>
      )}
    </td>
  )
}
