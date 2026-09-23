'use client'

// รายการหมู่บ้าน — จัดกลุ่มตามอำเภอ แล้วเรียงตามชื่อหมู่บ้าน/หมู่ที่
// ข้อมูลส่วนใหญ่กระจุกอยู่ไม่กี่อำเภอ ถ้าเรียงตามวันที่สร้างจะหาหมู่บ้านที่ต้องการไม่เจอ

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import VillageTypeBadges from './VillageTypeBadges'
import { Users, ChevronRight, ChevronLeft, Search, X } from 'lucide-react'
import { PIN_DOT } from './village-type'

type Village = {
  id: number
  villageName: string
  villageNo: string
  tambon: string
  amphoe: string
  province: string
  zone: string
  isKpiVillage: boolean
  isQualityVillage: boolean
  createdAt: string | Date
  _count: { persons: number }
}

type TypeFilter = 'all' | 'kpi' | 'quality' | 'untyped'
const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all',     label: 'ทั้งหมด' },
  { value: 'kpi',     label: 'ประเมิน กพร.' },
  { value: 'quality', label: 'สู้เหล้าคุณภาพ' },
  { value: 'untyped', label: 'ยังไม่ระบุ' },
]

const PER_PAGE_OPTIONS = [20, 50, 100]

function matchType(v: Village, t: TypeFilter) {
  if (t === 'kpi') return v.isKpiVillage
  if (t === 'quality') return v.isQualityVillage
  if (t === 'untyped') return !v.isKpiVillage && !v.isQualityVillage
  return true
}

export default function VillagesList({ villages }: { villages: Village[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [amphoe, setAmphoe] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  // หมู่บ้านที่เพิ่งเพิ่มล่าสุด — ติดป้าย "ใหม่" ไว้ในแถวของมันเอง
  const latestId = useMemo(
    () =>
      villages.reduce<Village | null>(
        (a, v) => (!a || new Date(v.createdAt) > new Date(a.createdAt) ? v : a),
        null
      )?.id,
    [villages]
  )

  const amphoes = useMemo(
    () => [...new Set(villages.map((v) => `${v.province}|${v.amphoe}`))].sort((a, b) => a.localeCompare(b, 'th')),
    [villages]
  )

  const counts = useMemo(
    () =>
      TYPE_FILTERS.reduce<Record<TypeFilter, number>>(
        (acc, { value }) => ({ ...acc, [value]: villages.filter((v) => matchType(v, value)).length }),
        {} as Record<TypeFilter, number>
      ),
    [villages]
  )

  const q = query.trim().toLowerCase()
  const filtered = villages.filter(
    (v) =>
      matchType(v, type) &&
      (!amphoe || `${v.province}|${v.amphoe}` === amphoe) &&
      (!q || `${v.villageName} ${v.villageNo} ${v.tambon} ${v.amphoe} ${v.province}`.toLowerCase().includes(q))
  )

  // เรียงทั้งชุดก่อน (อำเภอ → ชื่อหมู่บ้าน → หมู่ที่) แล้วค่อยตัดหน้า
  // ตัดหน้าจากรายการที่เรียงแล้ว หัวกลุ่มอำเภอจึงยังถูกต้องในแต่ละหน้า
  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          a.province.localeCompare(b.province, 'th') ||
          a.amphoe.localeCompare(b.amphoe, 'th') ||
          a.villageName.localeCompare(b.villageName, 'th') ||
          (parseInt(a.villageNo) || 0) - (parseInt(b.villageNo) || 0)
      ),
    [filtered]
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const pageItems = sorted.slice(start, start + perPage)

  // เปลี่ยนตัวกรองแล้วกลับไปหน้าแรก
  useEffect(() => { setPage(1) }, [query, type, amphoe, perPage])

  // จัดกลุ่มตามอำเภอเฉพาะหมู่บ้านในหน้านี้
  const groups = useMemo(() => {
    const m = new Map<string, { province: string; amphoe: string; items: Village[] }>()
    for (const v of pageItems) {
      const key = `${v.province}|${v.amphoe}`
      if (!m.has(key)) m.set(key, { province: v.province, amphoe: v.amphoe, items: [] })
      m.get(key)!.items.push(v)
    }
    return [...m.values()]
  }, [pageItems])

  const hasFilter = !!q || type !== 'all' || !!amphoe

  function clearAll() {
    setQuery('')
    setType('all')
    setAmphoe('')
  }

  return (
    <div className="space-y-3">
      {/* ค้นหา + กรองอำเภอ */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาหมู่บ้าน ตำบล อำเภอ จังหวัด..."
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
          />
          {query && (
            <button type="button" aria-label="ล้างการค้นหา" onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={amphoe}
          onChange={(e) => setAmphoe(e.target.value)}
          aria-label="กรองตามอำเภอ"
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">ทุกอำเภอ</option>
          {amphoes.map((a) => {
            const [prov, amp] = a.split('|')
            return <option key={a} value={a}>อ.{amp} จ.{prov}</option>
          })}
        </select>
      </div>

      {/* กรองตามประเภท */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            aria-pressed={type === value}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors ${
              type === value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {value !== 'all' && <span className={`w-2 h-2 rounded-full ${PIN_DOT[value]}`} />}
            {label}
            <span className={type === value ? 'opacity-70' : 'text-gray-400'}>({counts[value]})</span>
          </button>
        ))}
      </div>

      {hasFilter && (
        <p className="text-xs text-gray-400 px-1">
          พบ {filtered.length} จาก {villages.length} หมู่บ้าน
          <button type="button" onClick={clearAll} className="ml-2 text-yellow-600 hover:underline">ล้างตัวกรอง</button>
        </p>
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-10 text-center">
          <p className="text-sm text-gray-400">ไม่พบหมู่บ้านที่ค้นหา</p>
          <button type="button" onClick={clearAll} className="mt-2 text-xs text-yellow-600 hover:underline">
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <section key={`${g.province}|${g.amphoe}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <header className="flex items-baseline justify-between gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 truncate">
                  อ.{g.amphoe} <span className="font-normal text-gray-400">จ.{g.province}</span>
                </h2>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {g.items.length}
                  {(() => {
                    const total = sorted.filter((v) => v.province === g.province && v.amphoe === g.amphoe).length
                    return total > g.items.length ? ` จาก ${total}` : ''
                  })()} หมู่บ้าน
                </span>
              </header>
              <ul className="divide-y divide-gray-50">
                {g.items.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/dashboard/villages/${v.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span
                        aria-hidden="true"
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          v.isKpiVillage ? PIN_DOT.kpi : v.isQualityVillage ? PIN_DOT.quality : PIN_DOT.untyped
                        }`}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-gray-800 truncate group-hover:text-yellow-700 transition-colors">
                          บ้าน{v.villageName}
                          <span className="ml-1.5 text-xs text-gray-400">หมู่ {v.villageNo}</span>
                          {v.id === latestId && (
                            <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full align-middle">ใหม่</span>
                          )}
                        </span>
                        <span className="block sm:hidden text-xs text-gray-400 truncate">ต.{v.tambon}</span>
                      </span>
                      <span className="hidden sm:block w-40 text-xs text-gray-500 truncate">ต.{v.tambon}</span>
                      <span className="hidden md:flex w-44 justify-end gap-1">
                        <VillageTypeBadges isKpiVillage={v.isKpiVillage} isQualityVillage={v.isQualityVillage} short showUntyped />
                      </span>
                      <span className="w-16 flex items-center justify-end gap-1 text-xs text-gray-500 tabular-nums">
                        <Users className="w-3 h-3 text-gray-300" />
                        {v._count.persons}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* แบ่งหน้า */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
            <p className="text-xs text-gray-400">
              แสดง {start + 1}–{start + pageItems.length} จาก {sorted.length} หมู่บ้าน
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">
                ต่อหน้า
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="ml-1.5 py-1 px-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="หน้าก่อนหน้า"
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === currentPage ? 'page' : undefined}
                      className={`min-w-7 px-2 py-1 rounded-lg border text-xs tabular-nums transition-colors ${
                        n === currentPage
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="หน้าถัดไป"
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
