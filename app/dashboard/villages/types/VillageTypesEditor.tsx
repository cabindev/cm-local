'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Check, AlertCircle } from 'lucide-react'
import { updateVillageTypes } from '@/app/actions/village'

type Village = {
  id: number
  villageName: string
  villageNo: string
  tambon: string
  amphoe: string
  province: string
  isKpiVillage: boolean
  isQualityVillage: boolean
}

type Flags = { isKpiVillage: boolean; isQualityVillage: boolean }

export default function VillageTypesEditor({ villages }: { villages: Village[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [amphoe, setAmphoe] = useState('')
  const [untypedOnly, setUntypedOnly] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const initial = useMemo(
    () => new Map(villages.map((v) => [v.id, { isKpiVillage: v.isKpiVillage, isQualityVillage: v.isQualityVillage }])),
    [villages]
  )
  const [flags, setFlags] = useState<Map<number, Flags>>(() => new Map(initial))

  const amphoes = useMemo(
    () => [...new Set(villages.map((v) => `${v.amphoe}|${v.province}`))].sort(),
    [villages]
  )

  const changedIds = villages
    .map((v) => v.id)
    .filter((id) => {
      const a = initial.get(id)!, b = flags.get(id)!
      return a.isKpiVillage !== b.isKpiVillage || a.isQualityVillage !== b.isQualityVillage
    })

  const q = query.trim().toLowerCase()
  const shown = villages.filter((v) => {
    if (untypedOnly && (initial.get(v.id)!.isKpiVillage || initial.get(v.id)!.isQualityVillage)) return false
    if (amphoe && `${v.amphoe}|${v.province}` !== amphoe) return false
    if (q && !`${v.villageName} ${v.villageNo} ${v.tambon} ${v.amphoe} ${v.province}`.toLowerCase().includes(q)) return false
    return true
  })

  const counts = [...flags.values()].reduce(
    (c, f) => ({
      kpi: c.kpi + (f.isKpiVillage ? 1 : 0),
      quality: c.quality + (f.isQualityVillage ? 1 : 0),
      untyped: c.untyped + (!f.isKpiVillage && !f.isQualityVillage ? 1 : 0),
    }),
    { kpi: 0, quality: 0, untyped: 0 }
  )

  function toggle(id: number, key: keyof Flags) {
    setMessage(null)
    setFlags((prev) => {
      const next = new Map(prev)
      const cur = next.get(id)!
      next.set(id, { ...cur, [key]: !cur[key] })
      return next
    })
  }

  function setAllShown(key: keyof Flags, value: boolean) {
    setMessage(null)
    setFlags((prev) => {
      const next = new Map(prev)
      for (const v of shown) next.set(v.id, { ...next.get(v.id)!, [key]: value })
      return next
    })
  }

  function save() {
    setMessage(null)
    const updates = changedIds.map((id) => ({ id, ...flags.get(id)! }))
    startTransition(async () => {
      try {
        const r = await updateVillageTypes(updates)
        setMessage({ ok: true, text: `บันทึกแล้ว ${r.updated} หมู่บ้าน` })
        router.refresh()
      } catch {
        setMessage({ ok: false, text: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' })
      }
    })
  }

  const allShownKpi = shown.length > 0 && shown.every((v) => flags.get(v.id)!.isKpiVillage)
  const allShownQuality = shown.length > 0 && shown.every((v) => flags.get(v.id)!.isQualityVillage)

  const checkCls = 'w-4 h-4 rounded border-gray-300 accent-yellow-400 cursor-pointer'

  return (
    <div className="space-y-3">
      {/* สรุป */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-md border bg-yellow-50 text-yellow-700 border-yellow-200">หมู่บ้านประเมิน กพร. {counts.kpi}</span>
        <span className="px-2.5 py-1 rounded-md border bg-sky-50 text-sky-700 border-sky-100">หมู่บ้านสู้เหล้าคุณภาพ {counts.quality}</span>
        <span className="px-2.5 py-1 rounded-md border bg-gray-50 text-gray-500 border-gray-200">ยังไม่ระบุ {counts.untyped}</span>
      </div>

      {/* ตัวกรอง */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาหมู่บ้าน ตำบล..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
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
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">ทุกอำเภอ</option>
          {amphoes.map((a) => {
            const [amp, prov] = a.split('|')
            return <option key={a} value={a}>อ.{amp} จ.{prov}</option>
          })}
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer px-1">
          <input type="checkbox" checked={untypedOnly} onChange={(e) => setUntypedOnly(e.target.checked)} className={checkCls} />
          เฉพาะที่ยังไม่ระบุ
        </label>
      </div>

      {/* ตาราง */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">หมู่บ้าน</th>
              <th className="font-medium px-3 py-2.5 w-36">
                <label className="flex flex-col items-center gap-1 cursor-pointer">
                  <span>ประเมิน กพร.</span>
                  <input type="checkbox" checked={allShownKpi} onChange={(e) => setAllShown('isKpiVillage', e.target.checked)}
                    aria-label="ติ๊กประเมิน กพร. ทุกหมู่บ้านที่แสดง" className={checkCls} />
                </label>
              </th>
              <th className="font-medium px-3 py-2.5 w-36">
                <label className="flex flex-col items-center gap-1 cursor-pointer">
                  <span>สู้เหล้าคุณภาพ</span>
                  <input type="checkbox" checked={allShownQuality} onChange={(e) => setAllShown('isQualityVillage', e.target.checked)}
                    aria-label="ติ๊กสู้เหล้าคุณภาพ ทุกหมู่บ้านที่แสดง" className={checkCls} />
                </label>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">ไม่พบหมู่บ้าน</td></tr>
            ) : shown.map((v) => {
              const f = flags.get(v.id)!
              const changed = changedIds.includes(v.id)
              return (
                <tr key={v.id} className={changed ? 'bg-yellow-50/60' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2.5">
                    <p className="text-gray-900">
                      บ้าน{v.villageName}
                      <span className="ml-1.5 text-xs text-gray-400">หมู่ {v.villageNo}</span>
                    </p>
                    <p className="text-xs text-gray-400">ต.{v.tambon} อ.{v.amphoe} จ.{v.province}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <input type="checkbox" checked={f.isKpiVillage} onChange={() => toggle(v.id, 'isKpiVillage')}
                      aria-label={`บ้าน${v.villageName} หมู่ ${v.villageNo} ประเมิน กพร.`} className={checkCls} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <input type="checkbox" checked={f.isQualityVillage} onChange={() => toggle(v.id, 'isQualityVillage')}
                      aria-label={`บ้าน${v.villageName} หมู่ ${v.villageNo} สู้เหล้าคุณภาพ`} className={checkCls} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* บันทึก */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="text-sm">
          {message ? (
            <span role="status" className={`inline-flex items-center gap-1.5 ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
              {message.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </span>
          ) : changedIds.length > 0 ? (
            <span className="text-gray-600">แก้ไขแล้ว {changedIds.length} หมู่บ้าน ยังไม่ได้บันทึก</span>
          ) : (
            <span className="text-gray-400">ยังไม่มีการเปลี่ยนแปลง</span>
          )}
        </div>
        <div className="flex gap-2">
          {changedIds.length > 0 && (
            <button type="button" onClick={() => { setFlags(new Map(initial)); setMessage(null) }} disabled={isPending}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              ยกเลิก
            </button>
          )}
          <button type="button" onClick={save} disabled={isPending || changedIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-gray-900 transition-colors">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
          </button>
        </div>
      </div>
    </div>
  )
}
