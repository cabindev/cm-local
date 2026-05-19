import { prisma } from '@/app/lib/prisma'
import ReportFilter from './ReportFilter'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = { title: 'รายงาน | Community Driven' }

const PAGE_SIZE = 100

type SP = {
  q?: string; province?: string; amphoe?: string; villageId?: string
  group?: string; gender?: string; tab?: string; page?: string
}

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

function Tick({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 className="w-4 h-4 text-yellow-500 mx-auto" />
    : <XCircle className="w-4 h-4 text-gray-200 mx-auto" />
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<SP> }) {
  const {
    q = '', province = '', amphoe = '', villageId = '',
    group = '', gender = '', tab = 'persons', page = '0',
  } = await searchParams

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
          alcohol: true, tobacco: true, dnd: true,
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
          <h1 className="text-2xl font-black text-gray-900">รายงานข้อมูล</h1>
          <p className="text-sm text-gray-500 mt-0.5">ตารางครบทุกฟิลด์ · Export Excel ได้</p>
        </div>

        <ReportFilter
          provinces={provinces} amphoes={amphoes} villages={villages}
          q={q} province={province} amphoe={amphoe} villageId={villageId}
          group={group} gender={gender} tab={tab} total={total}
        />

        {persons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-12 text-center">
            <p className="text-sm text-gray-400">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-900 text-center px-3 py-3 font-semibold text-gray-400 w-12">#</th>
                      <th className="sticky left-12 z-10 bg-gray-900 text-left px-4 py-3 font-semibold min-w-40 border-r border-gray-700">ชื่อ-สกุล</th>
                      <th className="text-center px-3 py-3 font-semibold text-gray-300 w-14">เพศ</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-28">หมู่บ้าน</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-24">ตำบล</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-24">อำเภอ</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-28">จังหวัด</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-20">ภาค</th>
                      <th className="text-left px-3 py-3 font-semibold text-amber-300 border-l border-gray-700 min-w-24">เหล้า-ประเภท</th>
                      <th className="text-left px-3 py-3 font-semibold text-amber-300 min-w-32">เหล้า-ปี1</th>
                      <th className="text-left px-3 py-3 font-semibold text-amber-300 min-w-32">เหล้า-ปี2</th>
                      <th className="text-left px-3 py-3 font-semibold text-amber-300 min-w-36">เหล้า-ปี3</th>
                      <th className="text-left px-3 py-3 font-semibold text-blue-300 border-l border-gray-700 min-w-28">บุหรี่-ประเภท</th>
                      <th className="text-left px-3 py-3 font-semibold text-blue-300 min-w-32">บุหรี่-ปี1</th>
                      <th className="text-left px-3 py-3 font-semibold text-blue-300 min-w-32">บุหรี่-ปี2</th>
                      <th className="text-left px-3 py-3 font-semibold text-blue-300 min-w-36">บุหรี่-ปี3</th>
                      <th className="text-left px-3 py-3 font-semibold text-orange-300 border-l border-gray-700 min-w-40">ดื่มไม่ขับ-ประเภท</th>
                      <th className="text-left px-3 py-3 font-semibold text-orange-300 min-w-40">ดื่มไม่ขับ-ปี1</th>
                      <th className="text-left px-3 py-3 font-semibold text-orange-300 min-w-40">ดื่มไม่ขับ-ปี2</th>
                      <th className="text-left px-3 py-3 font-semibold text-orange-300 min-w-40">ดื่มไม่ขับ-ปี3</th>
                      {OUTCOMES.flatMap((k) =>
                        [1,2,3].map((y) => (
                          <th key={`${k}${y}`} className="text-left px-3 py-3 font-semibold text-green-300 border-l border-gray-700 min-w-24">
                            {OUTCOME_TH[k]}-ปี{y}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {persons.map((p, i) => {
                      const rowNo = skip + i + 1
                      const alc = p.alcohol as Record<string,unknown> | null
                      const tob = p.tobacco as Record<string,unknown> | null
                      const dnd = p.dnd
                      const bg = i % 2 === 1 ? 'bg-gray-50' : 'bg-white'

                      return (
                        <tr key={p.id} className={`hover:bg-yellow-50 transition-colors ${bg}`}>
                          <td className={`sticky left-0 z-10 text-center px-3 py-2.5 text-gray-400 font-mono ${bg}`}>{rowNo}</td>
                          <td className={`sticky left-12 z-10 px-4 py-2.5 font-semibold border-r border-gray-100 ${bg}`}>
                            <a href={`/dashboard/villages/${p.village.id}/persons/${p.id}/edit`}
                              className="text-gray-900 hover:text-yellow-700 transition-colors">{p.name}</a>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.gender === 'ชาย' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                              {p.gender}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">บ้าน{p.village.villageName} ม.{p.village.villageNo}</td>
                          <td className="px-3 py-2.5 text-gray-600">{p.village.tambon}</td>
                          <td className="px-3 py-2.5 text-gray-600">{p.village.amphoe}</td>
                          <td className="px-3 py-2.5 text-gray-600">{p.village.province}</td>
                          <td className="px-3 py-2.5 text-gray-500">{p.village.zone}</td>
                          <td className="px-3 py-2.5 border-l border-gray-100">
                            {alc ? <span className="text-amber-700">{alc.drinkType as string}</span> : <span className="text-gray-200">—</span>}
                          </td>
                          <td className="px-3 py-2.5">{alc ? <span className="text-gray-700">{alc.statusY1 as string}</span> : <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5">{(alc?.statusY2 as string) ? <span className="text-gray-700">{alc!.statusY2 as string}</span> : <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5">{(alc?.statusY3 as string) ? <span className="font-medium text-gray-900">{alc!.statusY3 as string}</span> : <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5 border-l border-gray-100">
                            {tob ? <span className="text-blue-700">{tob.smokeType as string}</span> : <span className="text-gray-200">—</span>}
                          </td>
                          <td className="px-3 py-2.5">{tob ? <span className="text-gray-700">{tob.statusY1 as string}</span> : <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5">{(tob?.statusY2 as string) ? <span className="text-gray-700">{tob!.statusY2 as string}</span> : <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5">{(tob?.statusY3 as string) ? <span className="font-medium text-gray-900">{tob!.statusY3 as string}</span> : <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5 border-l border-gray-100">
                            {dnd ? <span className="text-orange-700">{dnd.drinkType}</span> : <span className="text-gray-200">—</span>}
                          </td>
                          <td className="px-3 py-2.5">{dnd?.year1Result ?? <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5">{dnd?.year2Result ?? <span className="text-gray-200">—</span>}</td>
                          <td className="px-3 py-2.5">{dnd?.year3Result ?? <span className="text-gray-200">—</span>}</td>
                          {OUTCOMES.flatMap((k) =>
                            [1,2,3].map((y) => {
                              const bk = `y${y}${k}`, tk = `y${y}${k}Text`
                              const checked = alc?.[bk] || tob?.[bk]
                              const text = (alc?.[tk] || tob?.[tk]) as string | undefined
                              return (
                                <td key={`${k}${y}`} className="px-3 py-2.5 border-l border-gray-50">
                                  {checked ? <span className="text-green-700 font-medium">{text || '✓'}</span> : <span className="text-gray-200">—</span>}
                                </td>
                              )
                            })
                          )}
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
                แสดง <span className="font-semibold text-gray-700">{skip + 1}–{Math.min(skip + PAGE_SIZE, total)}</span> จาก <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> รายการ
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
                            className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-colors ${item === currentPage ? 'bg-gray-900 text-white font-bold' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
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

  const allVillages = await prisma.village.findMany({
    where: villageWhere,
    orderBy: { zone: 'asc' },
    include: {
      screeningResults: true,
      communityBackgrounds: true,
      envItems: true,
      communityOrgs: true,
      _count: { select: { persons: true } },
    },
  })

  return (
    <div className="max-w-full space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">รายงานข้อมูล</h1>
        <p className="text-sm text-gray-500 mt-0.5">ข้อมูลระดับหมู่บ้าน — ผลคัดกรอง · สิ่งแวดล้อม · การมีส่วนร่วม</p>
      </div>

      <ReportFilter
        provinces={provinces} amphoes={amphoes} villages={villages}
        q={q} province={province} amphoe={amphoe} villageId={villageId}
        group={group} gender={gender} tab={tab} total={allVillages.length}
      />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-900 text-center px-3 py-3 font-semibold text-gray-400 w-10">#</th>
                <th className="sticky left-10 z-10 bg-gray-900 text-left px-4 py-3 font-semibold min-w-36 border-r border-gray-700">หมู่บ้าน</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-28">จังหวัด</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-300 min-w-20">ภาค</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-300 min-w-20">ประชากร</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-300 min-w-20">สมาชิก</th>
                <th className="text-center px-3 py-3 font-semibold text-purple-300 border-l border-gray-700 min-w-24">ปฏิทินชุมชน</th>
                <th className="text-center px-3 py-3 font-semibold text-purple-300 min-w-24">สถานที่เสี่ยง</th>
                <th className="text-center px-3 py-3 font-semibold text-purple-300 min-w-28">นโยบายมีส่วนร่วม</th>
                <th className="text-center px-3 py-3 font-semibold text-purple-300 min-w-28">นโยบายพัฒนา</th>
                <th className="text-center px-3 py-3 font-semibold text-purple-300 min-w-24">ประวัติชุมชน</th>
                <th className="text-right px-3 py-3 font-semibold text-amber-300 border-l border-gray-700 min-w-20">คัดกรอง</th>
                <th className="text-right px-3 py-3 font-semibold text-amber-300 min-w-20">เหล้า%</th>
                <th className="text-right px-3 py-3 font-semibold text-amber-300 min-w-20">บุหรี่%</th>
                <th className="text-right px-3 py-3 font-semibold text-amber-300 min-w-20">ขับเมา%</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 border-l border-gray-700 min-w-20">งานศพ</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 min-w-20">นโยบาย</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 min-w-20">กติกา</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 min-w-20">งานประเพณี</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 min-w-20">ร้านค้า</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 min-w-20">ไม่ขายเหล้า</th>
                <th className="text-center px-3 py-3 font-semibold text-green-300 min-w-20">ห้ามดื่ม</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-300 border-l border-gray-700 min-w-24">สถานศึกษา</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-300 min-w-20">วัด</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-300 min-w-20">อบต.</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-300 min-w-20">กำนัน</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-300 min-w-20">รพ.สต.</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-300 min-w-24">กลุ่มองค์กร</th>
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
                    <td className={`sticky left-0 z-10 text-center px-3 py-2.5 text-gray-400 ${bg}`}>{i+1}</td>
                    <td className={`sticky left-10 z-10 px-4 py-2.5 font-semibold border-r border-gray-100 ${bg}`}>
                      <a href={`/dashboard/villages/${v.id}`} className="text-gray-900 hover:text-yellow-700">
                        บ้าน{v.villageName} ม.{v.villageNo}
                      </a>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{v.province}</td>
                    <td className="px-3 py-2.5 text-gray-500">{v.zone}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{v.actualPopulation.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{v._count.persons}</td>
                    <td className="px-3 py-2.5 border-l border-gray-100"><Tick ok={!!bm.communityCalendar?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!bm.riskLocation?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!bm.participationPolicy?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!bm.capacityPolicy?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!bm.communityHistory?.hasItem} /></td>
                    <td className="px-3 py-2.5 text-right border-l border-gray-100">
                      {sc > 0 ? <span className="font-semibold text-gray-900">{sc.toLocaleString()}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right">{alcPct !== null ? <span className="text-amber-700 font-semibold">{alcPct}%</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-right">{tobPct !== null ? <span className="text-amber-700 font-semibold">{tobPct}%</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-right">{dndPct !== null ? <span className="text-amber-700 font-semibold">{dndPct}%</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5 border-l border-gray-100"><Tick ok={!!em.funeral?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!em.funeral?.hasPolicy} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!em.funeral?.hasCommunityRule} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!em.tradition?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!em.shop?.hasItem} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!em.shop?.noAlcohol} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!em.nodrinkzone?.hasItem} /></td>
                    <td className="px-3 py-2.5 border-l border-gray-100"><Tick ok={!!om.school?.hasParticipation} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!om.temple?.hasParticipation} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!om.localAdmin?.hasParticipation} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!om.villageAdmin?.hasParticipation} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!om.hospital?.hasParticipation} /></td>
                    <td className="px-3 py-2.5"><Tick ok={!!om.orgGroup?.hasParticipation} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-400">{allVillages.length} หมู่บ้าน</p>
    </div>
  )
}
