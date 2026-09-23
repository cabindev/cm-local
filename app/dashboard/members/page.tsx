import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { Wine, Cigarette, Car, ChevronLeft, ChevronRight, ChevronRight as Caret } from 'lucide-react'
import MembersFilter from './MembersFilter'

export const metadata = { title: "ผู้เข้าร่วมโครงการ | Community Driven" }

const PAGE_SIZE = 50

type SearchParams = { q?: string; group?: string; province?: string; amphoe?: string; status?: string; page?: string }

// "ยังไม่ครบ" = มีข้อมูลกลุ่มใดกลุ่มหนึ่ง แต่ผลปี 2 หรือปี 3 ยังว่าง
// กรองในฐานข้อมูลเพื่อให้จำนวนรวมและการแบ่งหน้าตรงกัน (เดิมกรองหลังดึงข้อมูล ทำให้ตัวเลขเพี้ยน)
const PENDING_OR = [
  { alcohol: { is: { OR: [{ statusY2: null }, { statusY2: '' }, { statusY3: null }, { statusY3: '' }] } } },
  { tobacco: { is: { OR: [{ statusY2: null }, { statusY2: '' }, { statusY3: null }, { statusY3: '' }] } } },
  { dnd:     { is: { OR: [{ year2Result: null }, { year2Result: '' }, { year3Result: null }, { year3Result: '' }] } } },
]

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = '', group = '', province = '', amphoe = '', status = '', page = '0' } = await searchParams
  const currentPage = Math.max(0, Number(page) || 0)
  const skip = currentPage * PAGE_SIZE

  const where = {
    AND: [
      q ? {
        OR: [
          { name:    { contains: q } },
          { village: { villageName: { contains: q } } },
          { village: { province:   { contains: q } } },
          { village: { amphoe:     { contains: q } } },
        ],
      } : {},
      group === 'alcohol' ? { alcohol: { isNot: null } } : {},
      group === 'tobacco' ? { tobacco: { isNot: null } } : {},
      group === 'dnd'     ? { dnd:     { isNot: null } } : {},
      province ? { village: { province } } : {},
      amphoe   ? { village: { amphoe } }   : {},
      status === 'pending'  ? { OR: PENDING_OR }        : {},
      status === 'complete' ? { NOT: { OR: PENDING_OR } } : {},
    ],
  }

  const [persons, total, provinces, amphoes] = await Promise.all([
    prisma.person.findMany({
      where,
      include: {
        village: { select: { id: true, villageName: true, villageNo: true, tambon: true, amphoe: true, province: true } },
        alcohol: { select: { drinkType: true, statusY1: true, statusY2: true, statusY3: true } },
        tobacco: { select: { smokeType: true, statusY1: true, statusY2: true, statusY3: true } },
        dnd:     { select: { year1Result: true, year2Result: true, year3Result: true } },
      },
      // เรียงให้หมู่บ้านเดียวกันอยู่ติดกัน แล้วค่อยจัดหัวกลุ่มตอนแสดงผล
      orderBy: [
        { village: { province: 'asc' } },
        { village: { amphoe: 'asc' } },
        { village: { villageName: 'asc' } },
        { name: 'asc' },
      ],
      take: PAGE_SIZE,
      skip,
    }),
    prisma.person.count({ where }),
    prisma.village.findMany({ select: { province: true }, distinct: ['province'], orderBy: { province: 'asc' } })
      .then((r) => r.map((v) => v.province)),
    prisma.village.findMany({
      where: province ? { province } : {},
      select: { amphoe: true }, distinct: ['amphoe'], orderBy: { amphoe: 'asc' },
    }).then((r) => r.map((v) => v.amphoe)),
  ])

  const isIncomplete = (p: typeof persons[number]) =>
    !!((p.alcohol && (!p.alcohol.statusY2 || !p.alcohol.statusY3)) ||
       (p.tobacco && (!p.tobacco.statusY2 || !p.tobacco.statusY3)) ||
       (p.dnd     && (!p.dnd.year2Result   || !p.dnd.year3Result)))

  // จัดกลุ่มตามหมู่บ้านเฉพาะคนในหน้านี้
  const groups: { key: number; village: typeof persons[number]['village']; items: typeof persons }[] = []
  for (const p of persons) {
    const last = groups[groups.length - 1]
    if (last && last.key === p.village.id) last.items.push(p)
    else groups.push({ key: p.village.id, village: p.village, items: [p] })
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilter = !!(q || group || province || amphoe || status)

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ q, group, province, amphoe, status, page: String(p) })
    ;['q','group','province','amphoe','status'].forEach((k) => { if (!params.get(k)) params.delete(k) })
    if (p === 0) params.delete('page')
    return `/dashboard/members?${params.toString()}`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">ผู้เข้าร่วมโครงการ</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} คน ใน {provinces.length} จังหวัด</p>
      </div>

      <MembersFilter
        provinces={provinces} amphoes={amphoes}
        q={q} group={group} province={province} amphoe={amphoe} status={status}
      />

      {hasFilter && (
        <p className="text-xs text-gray-400">
          พบ <span className="text-gray-600">{total.toLocaleString()}</span> คน
          {totalPages > 1 && ` · หน้า ${currentPage + 1}/${totalPages}`}
        </p>
      )}

      {persons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-12 text-center">
          <p className="text-sm text-gray-400">ไม่พบผู้เข้าร่วมโครงการที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <section key={`${g.key}-${g.items[0].id}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <header className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <Link href={`/dashboard/villages/${g.village.id}`}
                  className="text-sm font-semibold text-gray-700 hover:text-yellow-700 truncate">
                  บ้าน{g.village.villageName}
                  <span className="ml-1.5 font-normal text-gray-400">หมู่ {g.village.villageNo}</span>
                  <span className="ml-2 font-normal text-gray-400">ต.{g.village.tambon} อ.{g.village.amphoe} จ.{g.village.province}</span>
                </Link>
                <span className="text-xs text-gray-400 whitespace-nowrap">{g.items.length} คน</span>
              </header>
              <ul className="divide-y divide-gray-50">
                {g.items.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/villages/${p.village.id}/persons/${p.id}/edit`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-yellow-700">{p.name.charAt(0)}</span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-gray-800 truncate group-hover:text-yellow-700 transition-colors">
                          {p.name}
                          {p.gender && <span className="ml-1.5 text-xs text-gray-400">{p.gender}</span>}
                        </span>
                        {isIncomplete(p) && (
                          <span className="text-[10px] text-yellow-700">ประเมินยังไม่ครบ 3 ปี</span>
                        )}
                      </span>
                      <span className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                        {p.alcohol && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full max-w-40 truncate">
                            <Wine className="w-3 h-3 flex-shrink-0" />
                            {p.alcohol.statusY3 || p.alcohol.statusY2 || p.alcohol.statusY1}
                          </span>
                        )}
                        {p.tobacco && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full max-w-40 truncate">
                            <Cigarette className="w-3 h-3 flex-shrink-0" />
                            {p.tobacco.statusY3 || p.tobacco.statusY2 || p.tobacco.statusY1}
                          </span>
                        )}
                        {p.dnd && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">
                            <Car className="w-3 h-3" />
                            ดื่มไม่ขับ
                          </span>
                        )}
                      </span>
                      <Caret className="w-3.5 h-3.5 text-gray-300 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* แบ่งหน้า */}
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-xs text-gray-400">
              แสดง {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} จาก {total.toLocaleString()} คน
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {currentPage > 0 && (
                  <Link href={buildHref(currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" /> ก่อนหน้า
                  </Link>
                )}
                <span className="text-xs text-gray-400 tabular-nums">หน้า {currentPage + 1} / {totalPages}</span>
                {currentPage < totalPages - 1 && (
                  <Link href={buildHref(currentPage + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    ถัดไป <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
