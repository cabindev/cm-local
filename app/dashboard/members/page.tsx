import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { Wine, Cigarette, Car, ChevronLeft, ChevronRight } from 'lucide-react'
import MembersFilter from './MembersFilter'

export const metadata = { title: "ผู้เข้าร่วมโครงการ | Community Driven" }

const PAGE_SIZE = 50

type SearchParams = { q?: string; group?: string; province?: string; status?: string; page?: string }

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = '', group = '', province = '', status = '', page = '0' } = await searchParams
  const skip = Number(page) * PAGE_SIZE

  const isIncompleteFilter = status === 'complete'
    ? { alcohol: { is: null } }   // placeholder — handled post-query
    : undefined

  // build where
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
    ],
  }

  const [persons, total, provinces] = await Promise.all([
    prisma.person.findMany({
      where,
      include: {
        village: { select: { id: true, villageName: true, villageNo: true, tambon: true, amphoe: true, province: true } },
        alcohol: { select: { drinkType: true, statusY1: true, statusY2: true, statusY3: true } },
        tobacco: { select: { smokeType: true, statusY1: true, statusY2: true, statusY3: true } },
        dnd:     { select: { year1Result: true, year2Result: true, year3Result: true } },
      },
      orderBy: [{ village: { province: 'asc' } }, { name: 'asc' }],
      take: PAGE_SIZE,
      skip,
    }),
    prisma.person.count({ where }),
    prisma.village.findMany({ select: { province: true }, distinct: ['province'], orderBy: { province: 'asc' } })
      .then((r) => r.map((v) => v.province)),
  ])

  const isIncomplete = (p: typeof persons[number]) =>
    (p.alcohol && (!p.alcohol.statusY2 || !p.alcohol.statusY3)) ||
    (p.tobacco && (!p.tobacco.statusY2 || !p.tobacco.statusY3)) ||
    (p.dnd    && (!p.dnd.year2Result   || !p.dnd.year3Result))

  // client-side status filter after fetch (small set per page)
  const displayed = status === 'complete'
    ? persons.filter((p) => !isIncomplete(p))
    : status === 'pending'
    ? persons.filter((p) => isIncomplete(p))
    : persons

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(page)

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ q, group, province, status, page: String(p) })
    ;['q','group','province','status'].forEach(k => { if (!params.get(k)) params.delete(k) })
    return `/dashboard/members?${params.toString()}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">ผู้เข้าร่วมโครงการ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total.toLocaleString()} คน ใน {provinces.length} จังหวัด
          </p>
        </div>
      </div>

      {/* Filter */}
      <MembersFilter provinces={provinces} q={q} group={group} province={province} status={status} />

      {/* Result count */}
      {(q || group || province || status) && (
        <p className="text-xs text-gray-400">
          พบ <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> คน
          {currentPage > 0 && ` · หน้า ${currentPage + 1}/${totalPages}`}
        </p>
      )}

      {/* List */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-12 text-center">
          <p className="text-sm text-gray-400">ไม่พบผู้เข้าร่วมโครงการที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {displayed.map((p, idx) => {
              const incomplete = isIncomplete(p)
              return (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/villages/${p.village.id}/persons/${p.id}/edit`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Index & Avatar */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-300 group-hover:text-yellow-600 transition-colors">
                        {skip + idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-yellow-700">{p.name.charAt(0)}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors">
                          {p.name}
                        </span>
                        {incomplete && (
                          <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full leading-none">
                            ยังไม่ครบ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        บ้าน{p.village.villageName} หมู่ {p.village.villageNo} · {p.village.tambon} · {p.village.amphoe} · {p.village.province}
                      </p>
                    </div>

                    {/* Group badges */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {p.alcohol && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          <Wine className="w-3 h-3" />
                          {p.alcohol.statusY3 ?? p.alcohol.statusY2 ?? p.alcohol.statusY1}
                        </span>
                      )}
                      {p.tobacco && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          <Cigarette className="w-3 h-3" />
                          {p.tobacco.statusY3 ?? p.tobacco.statusY2 ?? p.tobacco.statusY1}
                        </span>
                      )}
                      {p.dnd && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          <Car className="w-3 h-3" />
                          ดื่มไม่ขับ
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 text-xs">
            หน้า {currentPage + 1} / {totalPages} · แสดง {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} จาก {total.toLocaleString()} คน
          </span>
          <div className="flex gap-2">
            {currentPage > 0 && (
              <Link href={buildHref(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> ก่อนหน้า
              </Link>
            )}
            {currentPage < totalPages - 1 && (
              <Link href={buildHref(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                ถัดไป <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
