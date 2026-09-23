'use client'

// เลือกว่าจะแสดงกลุ่มคอลัมน์ไหนบ้าง — ตารางรายงานมีหลายสิบคอลัมน์
// เก็บค่าไว้ใน query string (`cols`) เพื่อให้ share ลิงก์ได้และ server อ่านค่าได้ตรงกัน

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export type ColumnGroup = { key: string; label: string; dot: string }

export default function ColumnToggles({
  param, groups, active,
}: {
  param: string
  groups: ColumnGroup[]
  active: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function toggle(key: string) {
    const next = active.includes(key) ? active.filter((k) => k !== key) : [...active, key]
    const params = new URLSearchParams(searchParams.toString())
    // ครบทุกกลุ่ม = ค่าเริ่มต้น ไม่ต้องใส่ใน URL
    if (next.length === groups.length) params.delete(param)
    else params.set(param, next.join(','))
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">คอลัมน์</span>
      {groups.map((g) => {
        const on = active.includes(g.key)
        return (
          <button
            key={g.key}
            type="button"
            onClick={() => toggle(g.key)}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors ${
              on ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${on ? g.dot : 'bg-gray-200'}`} />
            {g.label}
          </button>
        )
      })}
    </div>
  )
}
