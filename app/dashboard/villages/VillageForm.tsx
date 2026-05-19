'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createVillage } from '@/app/actions/village'
import { PROVINCE_ZONE } from '@/app/lib/province-zone'
import { useTambonSearch } from '@/app/hooks/useTambonSearch'

export default function VillageForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const { search, setSearch, selected, setSelected, showDropdown, setShowDropdown, filtered, selectTambon } = useTambonSearch()

  const zone = selected ? (PROVINCE_ZONE[selected.CHANGWAT_T] ?? '') : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const villageName = fd.get('villageName') as string
    const villageNo = fd.get('villageNo') as string
    const coordinator = fd.get('coordinator') as string
    const phone = fd.get('phone') as string
    const registeredPopulation = parseInt(fd.get('registeredPopulation') as string) || 0
    const actualPopulation = parseInt(fd.get('actualPopulation') as string) || 0
    const householdCount = parseInt(fd.get('householdCount') as string) || 0

    if (!villageName || !villageNo || !coordinator || !selected) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
      return
    }
    if (!zone) {
      setError('ไม่พบภาคสำหรับจังหวัดนี้ กรุณาติดต่อผู้ดูแลระบบ')
      return
    }

    startTransition(async () => {
      try {
        const v = await createVillage({
          villageName,
          villageNo,
          tambon: selected.TAMBON_T,
          amphoe: selected.AMPHOE_T,
          province: selected.CHANGWAT_T,
          zone,
          coordinator,
          phone: phone || undefined,
          registeredPopulation,
          actualPopulation,
          householdCount,
        })
        router.push(`/dashboard/villages/${v.id}`)
      } catch {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      {/* ชื่อหมู่บ้าน + หมู่ที่ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            ชื่อหมู่บ้าน <span className="text-red-500">*</span>
          </label>
          <input
            name="villageName"
            placeholder="เช่น ตอนแก้ว"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            หมู่ที่ <span className="text-red-500">*</span>
          </label>
          <input
            name="villageNo"
            placeholder="เช่น 5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>
      </div>

      {/* ที่ตั้ง */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ที่ตั้ง</p>

        {/* Tambon search */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-600">
            ค้นหาตำบล <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={selected ? `ต.${selected.TAMBON_T} อ.${selected.AMPHOE_T} จ.${selected.CHANGWAT_T}` : search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelected(null)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {showDropdown && filtered.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filtered.map((t, i) => (
                  <li
                    key={i}
                    onMouseDown={() => selectTambon(t)}
                    className="px-3 py-2 text-sm hover:bg-yellow-50 cursor-pointer"
                  >
                    ต.{t.TAMBON_T} อ.{t.AMPHOE_T} จ.{t.CHANGWAT_T}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Zone — auto-filled only */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <span className="text-sm text-gray-500 flex-shrink-0">ภาค</span>
          {zone ? (
            <span className="text-sm font-semibold text-gray-900">{zone}</span>
          ) : (
            <span className="text-sm text-gray-400 italic">กำหนดอัตโนมัติเมื่อเลือกตำบล</span>
          )}
        </div>
      </div>

      {/* ข้อมูลประชากร */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ข้อมูลประชากร</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'registeredPopulation', label: 'ตามทะเบียนบ้าน', unit: 'คน' },
            { name: 'actualPopulation', label: 'อาศัยอยู่จริง', unit: 'คน' },
            { name: 'householdCount', label: 'จำนวนครัวเรือน', unit: 'หลังคาเรือน' },
          ].map(({ name, label, unit }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-xs text-gray-500">{label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  name={name}
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ผู้ประสานงาน */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ผู้ประสานงาน</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">
              ชื่อผู้ประสานงาน <span className="text-red-500">*</span>
            </label>
            <input
              name="coordinator"
              placeholder="ชื่อ-นามสกุล"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">เบอร์โทรศัพท์</label>
            <input
              name="phone"
              placeholder="0xx-xxx-xxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-gray-900 transition-colors"
        >
          {isPending ? 'กำลังบันทึก...' : 'เพิ่มหมู่บ้าน'}
        </button>
      </div>
    </form>
  )
}
