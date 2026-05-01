'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createVillage, updateVillage, type VillageFormData } from '@/app/actions/village'
import { data as regions } from '@/app/data/regions'
import { Search, X, MapPin } from 'lucide-react'

type Props = {
  defaultValues?: VillageFormData & { id?: number }
}

export default function VillageForm({ defaultValues }: Props) {
  const router = useRouter()
  const isEdit = !!defaultValues?.id

  const [form, setForm] = useState<VillageFormData>({
    villageName: defaultValues?.villageName ?? '',
    villageNo: defaultValues?.villageNo ?? '',
    tambon: defaultValues?.tambon ?? '',
    amphoe: defaultValues?.amphoe ?? '',
    province: defaultValues?.province ?? '',
    zone: defaultValues?.zone ?? '',
    coordinator: defaultValues?.coordinator ?? '',
    phone: defaultValues?.phone ?? '',
    registeredPopulation: defaultValues?.registeredPopulation ?? 0,
    actualPopulation: defaultValues?.actualPopulation ?? 0,
    householdCount: defaultValues?.householdCount ?? 0,
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState(defaultValues?.tambon ? `${defaultValues.tambon} • ${defaultValues.amphoe} • ${defaultValues.province}` : '')
  const [debounced, setDebounced] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [locationSelected, setLocationSelected] = useState(!!defaultValues?.tambon)
  const searchRef = useRef<HTMLDivElement>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 250)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filter regions
  const results = useMemo(() => {
    if (!debounced || debounced.length < 2 || locationSelected) return []
    const term = debounced.toLowerCase()
    return regions
      .filter((r) =>
        r.district.toLowerCase().includes(term) ||
        r.amphoe.toLowerCase().includes(term) ||
        r.province.toLowerCase().includes(term)
      )
      .slice(0, 10)
  }, [debounced, locationSelected])

  const handleSelect = (r: typeof regions[0]) => {
    setForm((p) => ({ ...p, tambon: r.district, amphoe: r.amphoe, province: r.province, zone: r.zone }))
    setSearchTerm(`${r.district} • ${r.amphoe} • ${r.province}`)
    setLocationSelected(true)
    setShowDropdown(false)
  }

  const clearLocation = () => {
    setForm((p) => ({ ...p, tambon: '', amphoe: '', province: '', zone: '' }))
    setSearchTerm('')
    setLocationSelected(false)
    setShowDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.tambon) { setError('กรุณาเลือกตำบล'); return }
    setSaving(true)
    setError(null)
    try {
      if (isEdit && defaultValues?.id) {
        await updateVillage(defaultValues.id, form)
        router.push(`/dashboard/villages/${defaultValues.id}`)
      } else {
        const result = await createVillage(form)
        router.push(`/dashboard/villages/${result.id}`)
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700'
  const readonlyClass = 'mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

      {/* ชื่อหมู่บ้าน + หมู่ที่ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>ชื่อหมู่บ้าน <span className="text-red-500">*</span></label>
          <input
            required
            value={form.villageName}
            onChange={(e) => setForm((p) => ({ ...p, villageName: e.target.value }))}
            placeholder="เช่น ดอนแก้ว"
            className={inputClass}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>หมู่ที่ <span className="text-red-500">*</span></label>
          <input
            required
            value={form.villageNo}
            onChange={(e) => setForm((p) => ({ ...p, villageNo: e.target.value }))}
            placeholder="เช่น 5"
            className={inputClass}
          />
        </div>
      </div>

      {/* Location Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">ที่ตั้ง</h3>

        {/* Search box */}
        <div>
          <label className={labelClass}>ค้นหาตำบล <span className="text-red-500">*</span></label>
          <div ref={searchRef} className="relative mt-1">
            <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${locationSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent'}`}>
              <div className="pl-3 flex-shrink-0">
                {locationSelected
                  ? <MapPin className="w-4 h-4 text-yellow-600" />
                  : <Search className="w-4 h-4 text-gray-400" />
                }
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setLocationSelected(false)
                  setShowDropdown(true)
                }}
                onFocus={() => { if (!locationSelected) setShowDropdown(true) }}
                placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
                className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                readOnly={locationSelected}
              />
              {(searchTerm || locationSelected) && (
                <button type="button" onClick={clearLocation} className="pr-3 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-56 overflow-auto">
                {results.map((r, i) => (
                  <li
                    key={`${r.district_code}-${i}`}
                    onMouseDown={() => handleSelect(r)}
                    className="px-4 py-2.5 hover:bg-yellow-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-sm">ต.{r.district}</span>
                    <span className="text-gray-500 text-sm"> • อ.{r.amphoe}</span>
                    <span className="text-gray-400 text-sm"> • จ.{r.province}</span>
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{r.zone}</span>
                  </li>
                ))}
              </ul>
            )}

            {showDropdown && debounced.length >= 2 && results.length === 0 && !locationSelected && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 p-3 text-sm text-gray-400 text-center shadow-lg">
                ไม่พบข้อมูล
              </div>
            )}
          </div>
        </div>

        {/* Auto-filled readonly fields */}
        {locationSelected && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">ตำบล</label>
              <p className={readonlyClass}>{form.tambon}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">อำเภอ</label>
              <p className={readonlyClass}>{form.amphoe}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">จังหวัด</label>
              <p className={readonlyClass}>{form.province}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ภาค</label>
              <p className={readonlyClass}>{form.zone}</p>
            </div>
          </div>
        )}
      </div>

      {/* ข้อมูลประชากร */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">ข้อมูลประชากร</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>ประชากรตามทะเบียนบ้าน</label>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number" min={0}
                value={form.registeredPopulation || ''}
                placeholder="0"
                onChange={(e) => setForm((p) => ({ ...p, registeredPopulation: Number(e.target.value) }))}
                className={inputClass.replace('mt-1 ', '')}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">คน</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>ประชากรที่อาศัยอยู่จริง</label>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number" min={0}
                value={form.actualPopulation || ''}
                placeholder="0"
                onChange={(e) => setForm((p) => ({ ...p, actualPopulation: Number(e.target.value) }))}
                className={inputClass.replace('mt-1 ', '')}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">คน</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>จำนวนครัวเรือน</label>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number" min={0}
                value={form.householdCount || ''}
                placeholder="0"
                onChange={(e) => setForm((p) => ({ ...p, householdCount: Number(e.target.value) }))}
                className={inputClass.replace('mt-1 ', '')}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">หลังคาเรือน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinator */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">ผู้ประสานงาน</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>ชื่อผู้ประสานงาน <span className="text-red-500">*</span></label>
            <input
              required
              value={form.coordinator}
              onChange={(e) => setForm((p) => ({ ...p, coordinator: e.target.value }))}
              placeholder="ชื่อ-นามสกุล"
              className={inputClass}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>เบอร์โทรศัพท์</label>
            <input
              value={form.phone ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="0xx-xxx-xxxx"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-yellow-400 text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหมู่บ้าน'}
        </button>
      </div>
    </form>
  )
}
