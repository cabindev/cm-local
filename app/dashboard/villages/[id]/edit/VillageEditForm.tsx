'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateVillage } from '@/app/actions/village'
import { PROVINCE_ZONE } from '@/app/lib/province-zone'
import { useTambonSearch } from '@/app/hooks/useTambonSearch'

type Village = {
  id: number
  villageName: string; villageNo: string
  tambon: string; amphoe: string; province: string; zone: string
  coordinator: string; phone: string | null
  registeredPopulation: number; actualPopulation: number; householdCount: number
}

export default function VillageEditForm({ village }: { village: Village }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [villageName, setVillageName] = useState(village.villageName)
  const [villageNo, setVillageNo]     = useState(village.villageNo)
  const [coordinator, setCoordinator] = useState(village.coordinator)
  const [phone, setPhone]             = useState(village.phone ?? '')
  const [regPop, setRegPop]           = useState(village.registeredPopulation)
  const [actPop, setActPop]           = useState(village.actualPopulation)
  const [households, setHouseholds]   = useState(village.householdCount)

  const { search, setSearch, selected, setSelected, showDropdown, setShowDropdown, filtered, selectTambon } =
    useTambonSearch({ TAMBON_T: village.tambon, AMPHOE_T: village.amphoe, CHANGWAT_T: village.province })

  const zone = selected ? (PROVINCE_ZONE[selected.CHANGWAT_T] ?? village.zone) : village.zone

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!villageName || !villageNo || !coordinator || !selected || !zone) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'); return
    }
    startTransition(async () => {
      try {
        await updateVillage(village.id, {
          villageName, villageNo,
          tambon: selected.TAMBON_T, amphoe: selected.AMPHOE_T, province: selected.CHANGWAT_T, zone,
          coordinator, phone: phone || undefined,
          registeredPopulation: regPop, actualPopulation: actPop, householdCount: households,
        })
        router.push(`/dashboard/villages/${village.id}`)
      } catch { setError('เกิดข้อผิดพลาด กรุณาลองใหม่') }
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">ชื่อหมู่บ้าน <span className="text-red-500">*</span></label>
          <input value={villageName} onChange={(e) => setVillageName(e.target.value)} className={inputCls} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">หมู่ที่ <span className="text-red-500">*</span></label>
          <input value={villageNo} onChange={(e) => setVillageNo(e.target.value)} className={inputCls} required />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ที่ตั้ง</p>
        <div className="relative">
          <label className="text-sm text-gray-600">ค้นหาตำบล <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={selected ? `ต.${selected.TAMBON_T} อ.${selected.AMPHOE_T} จ.${selected.CHANGWAT_T}` : search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
            className={`mt-1 ${inputCls}`}
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {filtered.map((t, i) => (
                <li key={i} onMouseDown={() => selectTambon(t)}
                  className="px-3 py-2 text-sm hover:bg-yellow-50 cursor-pointer">
                  ต.{t.TAMBON_T} อ.{t.AMPHOE_T} จ.{t.CHANGWAT_T}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <span className="text-sm text-gray-500 flex-shrink-0">ภาค</span>
          {zone ? <span className="text-sm font-semibold text-gray-900">{zone}</span>
                : <span className="text-sm text-gray-400 italic">กำหนดอัตโนมัติเมื่อเลือกตำบล</span>}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ข้อมูลประชากร</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'ตามทะเบียนบ้าน', val: regPop, set: setRegPop, unit: 'คน' },
            { label: 'อาศัยอยู่จริง',   val: actPop, set: setActPop, unit: 'คน' },
            { label: 'จำนวนครัวเรือน',  val: households, set: setHouseholds, unit: 'หลัง' },
          ].map(({ label, val, set, unit }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs text-gray-500">{label}</label>
              <div className="flex items-center gap-1.5">
                <input type="number" min="0" value={val}
                  onChange={(e) => set(parseInt(e.target.value) || 0)} className={inputCls} />
                <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ผู้ประสานงาน</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">ชื่อผู้ประสานงาน <span className="text-red-500">*</span></label>
            <input value={coordinator} onChange={(e) => setCoordinator(e.target.value)} className={inputCls} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">เบอร์โทรศัพท์</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0xx-xxx-xxxx" className={inputCls} />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-gray-900 transition-colors">
          {isPending ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
        </button>
      </div>
    </form>
  )
}
