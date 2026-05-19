'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'

const GROUPS = [
  { key: '',        label: 'ทั้งหมด' },
  { key: 'alcohol', label: 'เหล้า' },
  { key: 'tobacco', label: 'บุหรี่' },
  { key: 'dnd',     label: 'ดื่มไม่ขับ' },
]

const STATUS = [
  { key: '',         label: 'ทุกสถานะ' },
  { key: 'complete', label: 'ประเมินครบ' },
  { key: 'pending',  label: 'ยังไม่ครบ' },
]

export default function MembersFilter({
  provinces,
  q, group, province, status,
}: {
  provinces: string[]
  q: string
  group: string
  province: string
  status: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  return (
    <div className="space-y-2">
      {/* ค้นหา */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => update('q', e.target.value)}
          placeholder="ค้นหาชื่อ หมู่บ้าน จังหวัด..."
          className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
        />
        {q && (
          <button onClick={() => update('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* filter row */}
      <div className="flex flex-wrap gap-2">
        {/* กลุ่ม */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-xs font-medium">
          {GROUPS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => update('group', key)}
              className={`px-3 py-2 border-r border-gray-100 last:border-0 transition-colors ${
                group === key ? 'bg-gray-900 text-yellow-400' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* สถานะ */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-xs font-medium">
          {STATUS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => update('status', key)}
              className={`px-3 py-2 border-r border-gray-100 last:border-0 transition-colors ${
                status === key ? 'bg-gray-900 text-yellow-400' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* จังหวัด */}
        <select
          value={province}
          onChange={(e) => update('province', e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">ทุกจังหวัด</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  )
}
