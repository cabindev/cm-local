import { prisma } from '@/app/lib/prisma'
import ReportFilter from './ReportFilter'
import ColumnToggles, { type ColumnGroup } from './ColumnToggles'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = { title: 'รายงาน | Community Driven' }

const PAGE_SIZE = 100

type SP = {
  q?: string; province?: string; amphoe?: string; villageId?: string
  group?: string; gender?: string; tab?: string; page?: string
  sort?: string; dir?: string; cols?: string; vcols?: string
}

// กลุ่มคอลัมน์ที่เปิด/ปิดได้ — ตารางมีหลายสิบคอลัมน์ ถ้าโชว์หมดต้องเลื่อนแนวนอนยาวมาก
const PERSON_GROUPS: ColumnGroup[] = [
  { key: 'area', label: 'พื้นที่',     dot: 'bg-gray-400' },
  { key: 'alc',  label: 'เหล้า',       dot: 'bg-amber-400' },
  { key: 'tob',  label: 'บุหรี่',      dot: 'bg-blue-400' },
  { key: 'dnd',  label: 'ดื่มไม่ขับ',  dot: 'bg-orange-400' },
  { key: 'out',  label: 'ผลลัพธ์',     dot: 'bg-green-400' },
]
const VILLAGE_GROUPS: ColumnGroup[] = [
  { key: 'bg',     label: 'ประวัติชุมชน',   dot: 'bg-purple-400' },
  { key: 'screen', label: 'ผลคัดกรอง',      dot: 'bg-amber-400' },
  { key: 'env',    label: 'สภาพแวดล้อม',    dot: 'bg-green-400' },
  { key: 'org',    label: 'การมีส่วนร่วม',  dot: 'bg-blue-400' },
]

function parseCols(raw: string | undefined, groups: ColumnGroup[]) {
  const all = groups.map((g) => g.key)
  if (raw === undefined) return all
  const picked = raw.split(',').filter((k) => all.includes(k))
  return picked
}

// หัวตารางแบบสว่าง — สีเข้มสงวนไว้ให้ sidebar เท่านั้น
const TH = 'px-3 py-2.5 font-medium text-gray-500'
const THL = `${TH} text-left`

function buildWhere(q: string, province: string, amphoe: string, villageId: string, group: string, gender: string) {
  return {
    AND: [
      q ? { OR: [{ name: { contains: q } }, { village: { villageName: { contains: q } } }] } : {},
      province  ? { village: { province } }        : {},
      amphoe    ? { village: { amphoe } }           : {},
      villageId ? { villageId: Number(villageId) }  : {},
      gender    ? { gender }                        : {},
      group === 'alcohol' ? { alcohol: { isNot: null } } : {},
      group === 'tobacco' ? { tobacco: { isNot: null } } : {},
      group === 'dnd'     ? { dnd:     { isNot: null } } : {},
    ],
  }
}

function SortTh({ label, col, sort, dir, params, className = '' }: {
  label: string; col: string; sort: string; dir: string
  params: Record<string, string>; className?: string
}) {
  const active = sort === col
  const nextDir = active && dir === 'asc' ? 'desc' : 'asc'
  const p = new URLSearchParams({ ...params, sort: col, dir: nextDir })
  return (
    <th className={`px-3 py-2.5 font-medium text-gray-500 cursor-pointer select-none hover:bg-gray-100 transition-colors ${className}`}>
      <a href={`/dashboard/report?${p.toString()}`} className="flex items-center gap-1">
        {label}
        <span className="text-[10px] opacity-60">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </a>
    </th>
  )
}

function Tick({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 className="w-4 h-4 text-yellow-500 mx-auto" />
    : <XCircle className="w-4 h-4 text-gray-200 mx-auto" />
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<SP> }) {
  const {
    q = '', province = '', amphoe = '', villageId = '',
    group = '', gender = '', tab = 'persons', page = '0',
    sort = 'zone', dir = 'asc', cols, vcols,
  } = await searchParams

  const personCols = parseCols(cols, PERSON_GROUPS)
  const villageCols = parseCols(vcols, VILLAGE_GROUPS)

  const currentPage = Number(page)
  const skip = currentPage * PAGE_SIZE

  // ── shared filter data ───────────────────────────────────────────────────
  const [provinces, amphoes, villages] = await Promise.all([
    prisma.village.findMany({ select: { province: true }, distinct: ['province'], orderBy: { province: 'asc' } })
      .then(r => r.map(v => v.province)),
    province
      ? prisma.village.findMany({ where: { province }, select: { amphoe: true }, distinct: ['amphoe'], orderBy: { amphoe: 'asc' } })
          .then(r => r.map(v => v.amphoe))
      : Promise.resolve([]),
    (province || amphoe)
      ? prisma.village.findMany({
          where: { ...(province ? { province } : {}), ...(amphoe ? { amphoe } : {}) },
          select: { id: true, villageName: true, villageNo: true },
          orderBy: { villageName: 'asc' },
        })
      : Promise.resolve([]),
  ])

  const OUTCOMES = ['Money','Property','Family','Health','Work','Accepted','Other'] as const
  const OUTCOME_TH: Record<string,string> = {
    Money:'เงินประหยัด', Property:'ทรัพย์สิน', Family:'ครอบครัว',
    Health:'สุขภาพ', Work:'อาชีพ', Accepted:'ยอมรับ', Other:'อื่นๆ',
  }

  // ── Person tab ───────────────────────────────────────────────────────────
  if (tab !== 'villages') {
    const where = buildWhere(q, province, amphoe, villageId, group, gender)
    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        include: {
          village: { select: { id: true, villageName: true, villageNo: true, tambon: true, amphoe: true, province: true, zone: true } },
          alcohol: true, tobacco: true, dnd: true, outcomes: true,
        },
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE, skip,
      }),
      prisma.person.count({ where }),
    ])
    const totalPages = Math.ceil(total / PAGE_SIZE)

    const buildHref = (p: number) => {
      const params = new URLSearchParams({ q, province, amphoe, villageId, group, gender, tab: 'persons', page: String(p) })
      ;['q','province','amphoe','villageId','group','gender'].forEach(k => { if (!params.get(k)) params.delete(k) })
      if (p === 0) params.delete('page')
      if (params.get('tab') === 'persons') params.delete('tab')
      return `/dashboard/report?${params.toString()}`
    }

    return (
      <div className="max-w-full space-y-4">
        <div>
          <h1 className="text-xl font-normal text-gray-700">รายงานข้อมูล</h1>
          <p className="text-sm text-gray-500 mt-0.5">ตารางครบทุกฟิลด์ · Export Excel ได้</p>
        </div>

        <ReportFilter
          provinces={provinces} amphoes={amphoes} villages={villages}
          q={q} province={province} amphoe={amphoe} villageId={villageId}
          group={group} gender={gender} tab={tab} total={total}
        />

        <ColumnToggles param="cols" groups={PERSON_GROUPS} active={personCols} />

        {persons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-12 text-center">
            <p className="text-sm text-gray-400">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
                    {/* แถวบน: ชื่อกลุ่มคอลัมน์ · แถวล่าง: ชื่อคอลัมน์จริง */}
                    <tr className="text-[11px] text-gray-400">
                      <th className="sticky left-0 z-10 bg-gray-50 w-12" />
                      <th className="sticky left-12 z-10 bg-gray-50 border-r border-gray-200" />
                      {personCols.includes('area') && <th colSpan={6} className="px-3 py-1.5 text-left font-medium border-l border-gray-200">พื้นที่</th>}
                      {personCols.includes('alc') && <th colSpan={4} className="px-3 py-1.5 text-left font-medium text-amber-600 border-l border-gray-200">เหล้า</th>}
                      {personCols.includes('tob') && <th colSpan={4} className="px-3 py-1.5 text-left font-medium text-blue-600 border-l border-gray-200">บุหรี่</th>}
                      {personCols.includes('dnd') && <th colSpan={4} className="px-3 py-1.5 text-left font-medium text-orange-600 border-l border-gray-200">ดื่มไม่ขับ</th>}
                      {personCols.includes('out') && <th colSpan={3} className="px-3 py-1.5 text-left font-medium text-green-600 border-l border-gray-200">ผลลัพธ์ที่เกิดขึ้น</th>}
                    </tr>
                    <tr className="border-t border-gray-100">
                      <th className={`sticky left-0 z-10 bg-gray-50 text-center ${TH} w-12`}>#</th>
                      <th className={`sticky left-12 z-10 bg-gray-50 ${THL} min-w-40 border-r border-gray-200`}>ชื่อ-สกุล</th>
                      {personCols.includes('area') && <>
                        <th className={`${TH} text-center w-14 border-l border-gray-200`}>เพศ</th>
                        <th className={`${THL} min-w-28`}>หมู่บ้าน</th>
                        <th className={`${THL} min-w-24`}>ตำบล</th>
                        <th className={`${THL} min-w-24`}>อำเภอ</th>
                        <th className={`${THL} min-w-28`}>จังหวัด</th>
                        <th className={`${THL} min-w-20`}>ภาค</th>
                      </>}
                      {personCols.includes('alc') && <>
                        <th className={`${THL} min-w-24 border-l border-gray-200`}>ประเภท</th>
                        <th className={`${THL} min-w-32`}>ปี 1</th>
                        <th className={`${THL} min-w-32`}>ปี 2</th>
                        <th className={`${THL} min-w-36`}>ปี 3</th>
                      </>}
                      {personCols.includes('tob') && <>
                        <th className={`${THL} min-w-28 border-l border-gray-200`}>ประเภท</th>
                        <th className={`${THL} min-w-32`}>ปี 1</th>
                        <th className={`${THL} min-w-32`}>ปี 2</th>
                        <th className={`${THL} min-w-36`}>ปี 3</th>
                      </>}
                      {personCols.includes('dnd') && <>
                        <th className={`${THL} min-w-40 border-l border-gray-200`}>ประเภท</th>
                        <th className={`${THL} min-w-40`}>ปี 1</th>
                        <th className={`${THL} min-w-40`}>ปี 2</th>
                        <th className={`${THL} min-w-40`}>ปี 3</th>
                      </>}
                      {personCols.includes('out') && [1, 2, 3].map((y) => (
                        <th key={y} className={`${THL} min-w-44 ${y === 1 ? 'border-l border-gray-200' : ''}`}>ปี {y}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {persons.map((p, i) => {
                      const rowNo = skip + i + 1
                      const alc = p.alcohol as Record<string,unknown> | null
                      const tob = p.tobacco as Record<string,unknown> | null
                      const dnd = p.dnd
                      const bg = i % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                      const dash = <span className="text-gray-300">—</span>

                      return (
                        <tr key={p.id} className={`hover:bg-yellow-50 transition-colors ${bg}`}>
                          <td className={`sticky left-0 z-10 text-center px-3 py-2.5 text-gray-400 tabular-nums ${bg}`}>{rowNo}</td>
                          <td className={`sticky left-12 z-10 px-4 py-2.5 border-r border-gray-100 ${bg}`}>
                            <a href={`/dashboard/villages/${p.village.id}/persons/${p.id}/edit`}
                              className="text-gray-900 hover:text-yellow-700 transition-colors">{p.name}</a>
                          </td>
                          {personCols.includes('area') && <>
                            <td className="px-3 py-2.5 text-center border-l border-gray-100">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${p.gender === 'ชาย' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                                {p.gender}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-700">บ้าน{p.village.villageName} ม.{p.village.villageNo}</td>
                            <td className="px-3 py-2.5 text-gray-600">{p.village.tambon}</td>
                            <td className="px-3 py-2.5 text-gray-600">{p.village.amphoe}</td>
                            <td className="px-3 py-2.5 text-gray-600">{p.village.province}</td>
                            <td className="px-3 py-2.5 text-gray-500">{p.village.zone}</td>
                          </>}
                          {personCols.includes('alc') && <>
                            <td className="px-3 py-2.5 border-l border-gray-100">{alc ? <span className="text-amber-700">{alc.drinkType as string}</span> : dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{(alc?.statusY1 as string) || dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{(alc?.statusY2 as string) || dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{(alc?.statusY3 as string) || dash}</td>
                          </>}
                          {personCols.includes('tob') && <>
                            <td className="px-3 py-2.5 border-l border-gray-100">{tob ? <span className="text-blue-700">{tob.smokeType as string}</span> : dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{(tob?.statusY1 as string) || dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{(tob?.statusY2 as string) || dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{(tob?.statusY3 as string) || dash}</td>
                          </>}
                          {personCols.includes('dnd') && <>
                            <td className="px-3 py-2.5 border-l border-gray-100">{dnd ? <span className="text-orange-700">{dnd.drinkType}</span> : dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{dnd?.year1Result || dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{dnd?.year2Result || dash}</td>
                            <td className="px-3 py-2.5 text-gray-700">{dnd?.year3Result || dash}</td>
                          </>}
                          {/* ผลลัพธ์ 7 ด้าน × 3 ปี เดิมกิน 21 คอลัมน์ — ยุบเหลือปีละคอลัมน์ แสดงเป็นป้าย */}
                          {personCols.includes('out') && [1, 2, 3].map((y) => {
                            const hits = p.outcomes.filter((o) => o.year === y && o.hasIt)
                            return (
                              <td key={y} className={`px-3 py-2.5 ${y === 1 ? 'border-l border-gray-100' : ''}`}>
                                {hits.length === 0 ? dash : (
                                  <span className="flex flex-wrap gap-1 max-w-44 whitespace-normal">
                                    {hits.map((o) => (
                                      <span key={o.id} title={o.detail || undefined}
                                        className="inline-block px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] border border-green-100">
                                        {OUTCOME_TH[o.outcomeType] ?? o.outcomeType}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                แสดง <span className="font-normal text-gray-600">{skip + 1}–{Math.min(skip + PAGE_SIZE, total)}</span> จาก <span className="font-normal text-gray-600">{total.toLocaleString()}</span> รายการ
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {currentPage > 0 && (
                    <Link href={buildHref(currentPage - 1)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                      <ChevronLeft className="w-3.5 h-3.5" />ก่อนหน้า
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 2)
                    .reduce<(number | 'gap')[]>((acc, i, idx, arr) => {
                      if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push('gap')
                      acc.push(i); return acc
                    }, [])
                    .map((item, idx) =>
                      item === 'gap'
                        ? <span key={`gap-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                        : <Link key={item} href={buildHref(item)}
                            className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-colors ${item === currentPage ? 'bg-gray-900 text-white font-medium' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                            {(item as number) + 1}
                          </Link>
                    )}
                  {currentPage < totalPages - 1 && (
                    <Link href={buildHref(currentPage + 1)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                      ถัดไป<ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Village tab ──────────────────────────────────────────────────────────
  const villageWhere = {
    ...(province  ? { province }            : {}),
    ...(amphoe    ? { amphoe }              : {}),
    ...(villageId ? { id: Number(villageId) } : {}),
  }

  const sortDir = (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
  const villageOrderBy =
    sort === 'persons'    ? { persons: { _count: sortDir } } :
    sort === 'population' ? { actualPopulation: sortDir }    :
    sort === 'village'    ? { villageName: sortDir }         :
    sort === 'amphoe'     ? { amphoe: sortDir }              :
    sort === 'province'   ? { province: sortDir }            :
    { zone: sortDir }

  const [allVillages, villageTotal] = await Promise.all([
    prisma.village.findMany({
      where: villageWhere,
      orderBy: villageOrderBy,
      take: PAGE_SIZE, skip,
      include: {
        screeningResults: true,
        communityBackgrounds: true,
        envItems: true,
        communityOrgs: true,
        _count: { select: { persons: true } },
      },
    }),
    prisma.village.count({ where: villageWhere }),
  ])
  const villageTotalPages = Math.ceil(villageTotal / PAGE_SIZE)
  const SORT_PARAMS = {
    tab: 'villages',
    ...(province ? { province } : {}),
    ...(amphoe ? { amphoe } : {}),
    ...(villageId ? { villageId } : {}),
    ...(vcols !== undefined ? { vcols: villageCols.join(',') } : {}),
  }

  const buildVillageHref = (pageNo: number) => {
    const params = new URLSearchParams({ tab: 'villages', sort, dir })
    if (province) params.set('province', province)
    if (amphoe) params.set('amphoe', amphoe)
    if (villageId) params.set('villageId', villageId)
    if (vcols !== undefined) params.set('vcols', villageCols.join(','))
    if (pageNo > 0) params.set('page', String(pageNo))
    return `/dashboard/report?${params.toString()}`
  }

  return (
    <div className="max-w-full space-y-4">
      <div>
        <h1 className="text-xl font-normal text-gray-700">รายงานข้อมูล</h1>
        <p className="text-sm text-gray-500 mt-0.5">ข้อมูลระดับหมู่บ้าน — ผลคัดกรอง · สภาพแวดล้อม · การมีส่วนร่วม</p>
      </div>

      <ReportFilter
        provinces={provinces} amphoes={amphoes} villages={villages}
        q={q} province={province} amphoe={amphoe} villageId={villageId}
        group={group} gender={gender} tab={tab} total={villageTotal}
      />

      <ColumnToggles param="vcols" groups={VILLAGE_GROUPS} active={villageCols} />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
              <tr className="text-[11px] text-gray-400">
                <th className="sticky left-0 z-10 bg-gray-50 w-10" />
                <th className="sticky left-10 z-10 bg-gray-50 border-r border-gray-200" />
                <th colSpan={5} className="px-3 py-1.5 text-left font-medium border-l border-gray-200">ข้อมูลพื้นฐาน</th>
                {villageCols.includes('bg') && <th colSpan={5} className="px-3 py-1.5 text-left font-medium text-purple-600 border-l border-gray-200">ประวัติชุมชน</th>}
                {villageCols.includes('screen') && <th colSpan={4} className="px-3 py-1.5 text-left font-medium text-amber-600 border-l border-gray-200">ผลคัดกรอง</th>}
                {villageCols.includes('env') && <th colSpan={9} className="px-3 py-1.5 text-left font-medium text-green-600 border-l border-gray-200">สภาพแวดล้อม</th>}
                {villageCols.includes('org') && <th colSpan={6} className="px-3 py-1.5 text-left font-medium text-blue-600 border-l border-gray-200">การมีส่วนร่วม</th>}
              </tr>
              <tr className="border-t border-gray-100">
                <th className={`sticky left-0 z-10 bg-gray-50 text-center ${TH} w-10`}>#</th>
                <SortTh label="หมู่บ้าน" col="village" sort={sort} dir={dir} params={SORT_PARAMS} className="sticky left-10 z-10 bg-gray-50 text-left min-w-36 border-r border-gray-200" />
                <th className={`${THL} min-w-24 border-l border-gray-200`}>อำเภอ</th>
                <SortTh label="จังหวัด" col="province" sort={sort} dir={dir} params={SORT_PARAMS} className="text-left min-w-28" />
                <SortTh label="ภาค" col="zone" sort={sort} dir={dir} params={SORT_PARAMS} className="text-left min-w-20" />
                <SortTh label="ประชากร" col="population" sort={sort} dir={dir} params={SORT_PARAMS} className="text-right min-w-20" />
                <SortTh label="สมาชิก" col="persons" sort={sort} dir={dir} params={SORT_PARAMS} className="text-right min-w-20" />
                {villageCols.includes('bg') && <>
                  <th className={`${TH} text-center min-w-24 border-l border-gray-200`}>ปฏิทินชุมชน</th>
                  <th className={`${TH} text-center min-w-24`}>สถานที่เสี่ยง</th>
                  <th className={`${TH} text-center min-w-28`}>นโยบายมีส่วนร่วม</th>
                  <th className={`${TH} text-center min-w-28`}>นโยบายพัฒนา</th>
                  <th className={`${TH} text-center min-w-24`}>ประวัติชุมชน</th>
                </>}
                {villageCols.includes('screen') && <>
                  <th className={`${TH} text-right min-w-20 border-l border-gray-200`}>คัดกรอง</th>
                  <th className={`${TH} text-right min-w-20`}>เหล้า%</th>
                  <th className={`${TH} text-right min-w-20`}>บุหรี่%</th>
                  <th className={`${TH} text-right min-w-20`}>ขับเมา%</th>
                </>}
                {villageCols.includes('env') && <>
                  <th className={`${TH} text-center min-w-20 border-l border-gray-200`}>งานศพ</th>
                  <th className={`${TH} text-center min-w-20`}>นโยบาย</th>
                  <th className={`${TH} text-center min-w-20`}>กติกา</th>
                  <th className={`${TH} text-center min-w-20`}>งานประเพณี</th>
                  <th className={`${TH} text-center min-w-24`}>ประเพณีปลอดเหล้า</th>
                  <th className={`${TH} text-center min-w-20`}>ร้านค้า</th>
                  <th className={`${TH} text-center min-w-20`}>ไม่ขายเหล้า</th>
                  <th className={`${TH} text-center min-w-24`}>สถานที่ห้ามดื่ม</th>
                  <th className={`${TH} text-center min-w-20`}>ห้ามดื่มห้ามขาย</th>
                </>}
                {villageCols.includes('org') && <>
                  <th className={`${TH} text-center min-w-24 border-l border-gray-200`}>สถานศึกษา</th>
                  <th className={`${TH} text-center min-w-20`}>วัด</th>
                  <th className={`${TH} text-center min-w-20`}>อบต.</th>
                  <th className={`${TH} text-center min-w-20`}>กำนัน</th>
                  <th className={`${TH} text-center min-w-20`}>รพ.สต.</th>
                  <th className={`${TH} text-center min-w-24`}>กลุ่มองค์กร</th>
                </>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allVillages.map((v, i) => {
                const s = v.screeningResults[0]
                const sc = s?.screenedCount ?? 0
                const alcPct = sc > 0 ? Math.round(((s!.alcoholRiskLow + s!.alcoholRisk + s!.alcoholDanger + s!.alcoholAddicted) / sc) * 100) : null
                const tobPct = sc > 0 ? Math.round((s!.tobaccoCount / sc) * 100) : null
                const dndPct = sc > 0 ? Math.round((s!.drinkAndDrive / sc) * 100) : null
                const bm = Object.fromEntries(v.communityBackgrounds.map(b => [b.itemType, b]))
                const em = Object.fromEntries(v.envItems.map(e => [e.itemType, e]))
                const om = Object.fromEntries(v.communityOrgs.map(o => [o.orgType, o]))
                const bg = i % 2 === 1 ? 'bg-gray-50' : 'bg-white'

                return (
                  <tr key={v.id} className={`hover:bg-yellow-50 transition-colors ${bg}`}>
                    <td className={`sticky left-0 z-10 text-center px-3 py-2.5 text-gray-400 tabular-nums ${bg}`}>{skip + i + 1}</td>
                    <td className={`sticky left-10 z-10 px-4 py-2.5 border-r border-gray-100 ${bg}`}>
                      <a href={`/dashboard/villages/${v.id}`} className="text-gray-900 hover:text-yellow-700">
                        บ้าน{v.villageName} ม.{v.villageNo}
                      </a>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 border-l border-gray-100">{v.amphoe}</td>
                    <td className="px-3 py-2.5 text-gray-600">{v.province}</td>
                    <td className="px-3 py-2.5 text-gray-500">{v.zone}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700 tabular-nums">{v.actualPopulation.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700 tabular-nums">{v._count.persons}</td>
                    {villageCols.includes('bg') && <>
                      <td className="px-3 py-2.5 border-l border-gray-100"><Tick ok={!!bm.communityCalendar?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!bm.riskLocation?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!bm.participationPolicy?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!bm.capacityPolicy?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!bm.communityHistory?.hasItem} /></td>
                    </>}
                    {villageCols.includes('screen') && <>
                      <td className="px-3 py-2.5 text-right border-l border-gray-100 tabular-nums">
                        {sc > 0 ? <span className="text-gray-700">{sc.toLocaleString()}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{alcPct !== null ? <span className="text-amber-700">{alcPct}%</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{tobPct !== null ? <span className="text-amber-700">{tobPct}%</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{dndPct !== null ? <span className="text-amber-700">{dndPct}%</span> : <span className="text-gray-300">—</span>}</td>
                    </>}
                    {villageCols.includes('env') && <>
                      <td className="px-3 py-2.5 border-l border-gray-100"><Tick ok={!!em.funeral?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.funeral?.hasPolicy} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.funeral?.hasCommunityRule} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.tradition?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.tradition?.hasTraditionEvent} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.shop?.hasItem} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.shop?.noAlcohol} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.nodrinkzone?.hasNoDrinkSite} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!em.nodrinkzone?.hasItem} /></td>
                    </>}
                    {villageCols.includes('org') && <>
                      <td className="px-3 py-2.5 border-l border-gray-100"><Tick ok={!!om.school?.hasParticipation} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!om.temple?.hasParticipation} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!om.localAdmin?.hasParticipation} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!om.villageAdmin?.hasParticipation} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!om.hospital?.hasParticipation} /></td>
                      <td className="px-3 py-2.5"><Tick ok={!!om.orgGroup?.hasParticipation} /></td>
                    </>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          แสดง {skip + 1}–{Math.min(skip + PAGE_SIZE, villageTotal)} จาก {villageTotal.toLocaleString()} หมู่บ้าน
        </p>
        {villageTotalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {currentPage > 0 && (
              <Link href={buildVillageHref(currentPage - 1)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                <ChevronLeft className="w-3.5 h-3.5" />ก่อนหน้า
              </Link>
            )}
            {Array.from({ length: villageTotalPages }, (_, i) => i)
              .filter((i) => i === 0 || i === villageTotalPages - 1 || Math.abs(i - currentPage) <= 2)
              .reduce<(number | 'gap')[]>((acc, i, idx, arr) => {
                if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push('gap')
                acc.push(i); return acc
              }, [])
              .map((item, idx) =>
                item === 'gap'
                  ? <span key={`gap-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                  : <Link key={item} href={buildVillageHref(item as number)}
                      className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-colors ${item === currentPage ? 'bg-gray-900 text-white font-medium' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                      {(item as number) + 1}
                    </Link>
              )}
            {currentPage < villageTotalPages - 1 && (
              <Link href={buildVillageHref(currentPage + 1)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                ถัดไป<ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
