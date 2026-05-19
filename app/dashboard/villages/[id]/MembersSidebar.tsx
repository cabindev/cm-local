'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Wine, Cigarette, Car, User, Pencil, ClipboardList, Search, Trash2 } from 'lucide-react'
import { deletePerson } from '@/app/actions/person'

type Person = {
  id: number
  name: string
  createdAt: Date
  alcohol: { drinkType: string; statusY1: string; statusY2: string | null; statusY3: string | null } | null
  tobacco: { smokeType: string; statusY1: string; statusY2: string | null; statusY3: string | null } | null
  dnd: { drinkType: string; year1Result: string | null; year2Result: string | null; year3Result: string | null } | null
}

function YearPills({ y1, y2, y3 }: { y1: string | null | undefined; y2: string | null | undefined; y3: string | null | undefined }) {
  const years = [
    { label: 'ปี1', val: y1 },
    { label: 'ปี2', val: y2 },
    { label: 'ปี3', val: y3 },
  ]
  return (
    <div className="flex items-center gap-0.5">
      {years.map(({ label, val }) => (
        <span
          key={label}
          title={val ?? 'ยังไม่ระบุ'}
          className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded leading-none ${
            val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {label}
          {val ? (
            <svg className="w-2 h-2 text-green-500" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-2 h-2 text-gray-300" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </span>
      ))}
    </div>
  )
}

type MissingChip = { label: string; cls: string }

function getMissingChips(p: Person): MissingChip[] {
  const chips: MissingChip[] = []
  if (p.alcohol) {
    if (!p.alcohol.statusY2) chips.push({ label: 'เหล้า ปี2', cls: 'bg-amber-100 text-amber-700 border-amber-200' })
    if (!p.alcohol.statusY3) chips.push({ label: 'เหล้า ปี3', cls: 'bg-amber-100 text-amber-700 border-amber-200' })
  }
  if (p.tobacco) {
    if (!p.tobacco.statusY2) chips.push({ label: 'บุหรี่ ปี2', cls: 'bg-blue-100 text-blue-700 border-blue-200' })
    if (!p.tobacco.statusY3) chips.push({ label: 'บุหรี่ ปี3', cls: 'bg-blue-100 text-blue-700 border-blue-200' })
  }
  if (p.dnd) {
    if (!p.dnd.year2Result) chips.push({ label: 'ดื่มไม่ขับ ปี2', cls: 'bg-orange-100 text-orange-700 border-orange-200' })
    if (!p.dnd.year3Result) chips.push({ label: 'ดื่มไม่ขับ ปี3', cls: 'bg-orange-100 text-orange-700 border-orange-200' })
  }
  return chips
}

export default function MembersSidebar({ villageId, persons }: { villageId: number; persons: Person[] }) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? persons.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : persons

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคุณ ${name}?`)) return
    try {
      await deletePerson(id, villageId)
    } catch {
      alert('เกิดข้อผิดพลาดในการลบสมาชิก')
    }
  }

  return (
    <div className="w-64 flex-shrink-0 space-y-3 sticky top-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">สมาชิกในหมู่บ้าน</p>
            <p className="text-xs text-gray-400">{persons.length} คน</p>
          </div>
          <div className="flex items-center gap-1.5">
            {persons.length > 0 && (
              <Link
                href={`/dashboard/villages/${villageId}/evaluate`}
                className="w-7 h-7 bg-gray-700 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-colors group"
                title="ประเมินแบบรายการ"
              >
                <ClipboardList className="w-4 h-4 text-gray-300 group-hover:text-gray-900" />
              </Link>
            )}
            <Link
              href={`/dashboard/villages/${villageId}/persons/new`}
              className="w-7 h-7 bg-yellow-400 hover:bg-yellow-500 rounded-lg flex items-center justify-center transition-colors"
              title="สักประวัติสมาชิก"
            >
              <Plus className="w-4 h-4 text-gray-900" />
            </Link>
          </div>
        </div>

        {persons.length > 0 && (
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาชื่อ..."
                className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-gray-50"
              />
            </div>
          </div>
        )}

        {persons.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <User className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">ยังไม่มีสมาชิก</p>
            <Link
              href={`/dashboard/villages/${villageId}/persons/new`}
              className="inline-block mt-3 text-xs font-semibold text-yellow-600 hover:underline"
            >
              + สักประวัติสมาชิก
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 max-h-[32rem] overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-gray-400">ไม่พบชื่อที่ค้นหา</li>
            )}
            {filtered.map((p, idx) => (
              <li key={p.id} className="px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-300 group-hover:text-yellow-600 transition-colors">{idx + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-yellow-700">{p.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        {idx === 0 && (
                          <span className="flex-shrink-0 text-[10px] font-bold bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded-full leading-none">ล่าสุด</span>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/villages/${villageId}/persons/${p.id}/edit`}
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-400 text-gray-500 hover:text-gray-900 transition-colors text-[10px] font-semibold"
                        title="แก้ไข / ประเมิน"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        ประเมิน
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="ลบสมาชิก"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Group badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.alcohol && (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          <Wine className="w-3 h-3" />{p.alcohol.drinkType}
                        </span>
                      )}
                      {p.tobacco && (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          <Cigarette className="w-3 h-3" />{p.tobacco.smokeType}
                        </span>
                      )}
                      {p.dnd && (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                          <Car className="w-3 h-3" />ดื่มไม่ขับ
                        </span>
                      )}
                    </div>

                    {/* Year progress pills */}
                    <div className="space-y-0.5 mt-1.5">
                      {p.alcohol && (
                        <div className="flex items-center gap-1.5">
                          <Wine className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                          <YearPills y1={p.alcohol.statusY1} y2={p.alcohol.statusY2} y3={p.alcohol.statusY3} />
                        </div>
                      )}
                      {p.tobacco && (
                        <div className="flex items-center gap-1.5">
                          <Cigarette className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
                          <YearPills y1={p.tobacco.statusY1} y2={p.tobacco.statusY2} y3={p.tobacco.statusY3} />
                        </div>
                      )}
                      {p.dnd && (
                        <div className="flex items-center gap-1.5">
                          <Car className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
                          <YearPills y1={p.dnd.year1Result} y2={p.dnd.year2Result} y3={p.dnd.year3Result} />
                        </div>
                      )}
                    </div>

                    {/* Incomplete badge */}
                    {getMissingChips(p).length > 0 && (
                      <span className="inline-block mt-1.5 text-[9px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 px-1.5 py-0.5 rounded-full leading-none">
                        ยังไม่ครบ
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {persons.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 space-y-2">
            <Link
              href={`/dashboard/villages/${villageId}/evaluate`}
              className="flex items-center justify-center gap-1.5 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              ประเมินแบบรายการ
            </Link>
            <Link
              href={`/dashboard/villages/${villageId}/persons/new`}
              className="flex items-center justify-center gap-1.5 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              สักประวัติสมาชิก
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
