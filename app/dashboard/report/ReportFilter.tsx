'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useState } from 'react'
import { Search, X, Download, Loader2, Users, MapPin } from 'lucide-react'

export default function ReportFilter({
  provinces, amphoes, villages,
  q, province, amphoe, villageId, group, gender, tab, total,
}: {
  provinces: string[]
  amphoes:   string[]
  villages:  { id: number; villageName: string; villageNo: string }[]
  q:         string
  province:  string
  amphoe:    string
  villageId: string
  group:     string
  gender:    string
  tab:       string
  total:     number
}) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [exporting, setExporting] = useState(false)

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) { params.set(key, value) } else { params.delete(key) }
    if (key === 'province') { params.delete('amphoe'); params.delete('villageId') }
    if (key === 'amphoe')   { params.delete('villageId') }
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  function setTab(t: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (t === 'persons') { params.delete('tab') } else { params.set('tab', t) }
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  async function handleExport() {
    setExporting(true)
    try {
      const params = new URLSearchParams({ q, province, amphoe, villageId, group, gender, tab })
      ;['q','province','amphoe','villageId','group','gender'].forEach(k => { if (!params.get(k)) params.delete(k) })
      if (tab !== 'villages') params.delete('tab')
      const res = await fetch(`/api/report/export?${params.toString()}`)
      if (!res.ok) throw new Error('export failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `conmunity-${tab === 'villages' ? 'villages' : 'persons'}-${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('เกิดข้อผิดพลาดในการ export') }
    finally { setExporting(false) }
  }

  const isVillageTab = tab === 'villages'

  return (
    <div className="space-y-2">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'persons',  label: 'สมาชิก',   icon: Users },
          { key: 'villages', label: 'หมู่บ้าน',  icon: MapPin },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === key || (key === 'persons' && tab !== 'villages')
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* ค้นหา - only for persons */}
        {!isVillageTab && (
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" defaultValue={q} onChange={(e) => update('q', e.target.value)}
              placeholder="ค้นหาชื่อ..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" />
            {q && <button onClick={() => update('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
          </div>
        )}

        {/* จังหวัด */}
        <select value={province} onChange={(e) => update('province', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-w-32">
          <option value="">ทุกจังหวัด</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* อำเภอ */}
        <select value={amphoe} onChange={(e) => update('amphoe', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-w-36"
          disabled={!province}>
          <option value="">ทุกอำเภอ</option>
          {amphoes.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* หมู่บ้าน */}
        <select value={villageId} onChange={(e) => update('villageId', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-w-40"
          disabled={!amphoe && !province}>
          <option value="">ทุกหมู่บ้าน</option>
          {villages.map((v) => <option key={v.id} value={String(v.id)}>บ้าน{v.villageName} ม.{v.villageNo}</option>)}
        </select>

        {/* กลุ่ม + เพศ - only for persons */}
        {!isVillageTab && (
          <>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-sm font-medium">
              {[['','ทั้งหมด'],['alcohol','เหล้า'],['tobacco','บุหรี่'],['dnd','ดื่มไม่ขับ']].map(([k,l]) => (
                <button key={k} onClick={() => update('group', k)}
                  className={`px-3 py-2 border-r border-gray-100 last:border-0 transition-colors ${group === k ? 'bg-gray-900 text-yellow-400' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-sm font-medium">
              {[['','ทุกเพศ'],['ชาย','ชาย'],['หญิง','หญิง']].map(([k,l]) => (
                <button key={k} onClick={() => update('gender', k)}
                  className={`px-3 py-2 border-r border-gray-100 last:border-0 transition-colors ${gender === k ? 'bg-gray-900 text-yellow-400' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {l}
                </button>
              ))}
            </div>

          </>
        )}

        <button onClick={handleExport} disabled={exporting || total === 0}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold text-sm rounded-lg transition-colors ml-auto">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Excel
        </button>
      </div>

      {total > 0 && (
        <p className="text-xs text-gray-400">
          {isVillageTab ? `${total} หมู่บ้าน` : `${total.toLocaleString()} รายการ`}
        </p>
      )}
    </div>
  )
}
