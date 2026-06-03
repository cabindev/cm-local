'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createVillage } from '@/app/actions/village'
import { PROVINCE_ZONE } from '@/app/lib/province-zone'
import { useTambonSearch } from '@/app/hooks/useTambonSearch'
import { Search, X, Lock, Loader2, AlertCircle } from 'lucide-react'

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

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-gray-400 transition-shadow'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100"
    >
      {/* ข้อมูลหมู่บ้าน */}
      <section className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">ข้อมูลหมู่บ้าน</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="villageName" className="text-sm font-medium text-gray-700">
              ชื่อหมู่บ้าน <span className="text-red-500">*</span>
            </label>
            <input
              id="villageName"
              name="villageName"
              placeholder="เช่น ตอนแก้ว"
              className={inputCls}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="villageNo" className="text-sm font-medium text-gray-700">
              หมู่ที่ <span className="text-red-500">*</span>
            </label>
            <input
              id="villageNo"
              name="villageNo"
              placeholder="เช่น 5"
              className={inputCls}
              required
            />
          </div>
        </div>
      </section>

      {/* ที่ตั้ง */}
      <section className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">ที่ตั้ง</h2>

        <div className="space-y-1.5">
          <label htmlFor="tambon-search" className="text-sm font-medium text-gray-700">
            ตำบล / อำเภอ / จังหวัด <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="tambon-search"
                type="text"
                value={
                  selected
                    ? `ต.${selected.TAMBON_T} อ.${selected.AMPHOE_T} จ.${selected.CHANGWAT_T}`
                    : search
                }
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelected(null)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
                className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-gray-400 transition-shadow"
              />
              {selected && (
                <button
                  type="button"
                  aria-label="ล้างการเลือก"
                  onClick={() => {
                    setSelected(null)
                    setSearch('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showDropdown && filtered.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filtered.map((t, i) => (
                  <li
                    key={i}
                    onMouseDown={() => selectTambon(t)}
                    className="px-3 py-2.5 text-sm text-gray-900 hover:bg-yellow-50 cursor-pointer"
                  >
                    ต.{t.TAMBON_T} อ.{t.AMPHOE_T} จ.{t.CHANGWAT_T}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 flex-shrink-0">ภาค</span>
          {zone ? (
            <span className="text-sm font-semibold text-gray-900">{zone}</span>
          ) : (
            <span className="text-sm text-gray-400 italic">กำหนดอัตโนมัติเมื่อเลือกตำบล</span>
          )}
        </div>
      </section>

      {/* ข้อมูลประชากร */}
      <section className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">ข้อมูลประชากร</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'registeredPopulation', label: 'ตามทะเบียนบ้าน', unit: 'คน' },
            { name: 'actualPopulation', label: 'อาศัยอยู่จริง', unit: 'คน' },
            { name: 'householdCount', label: 'จำนวนครัวเรือน', unit: 'หลัง' },
          ].map(({ name, label, unit }) => (
            <div key={name} className="space-y-1.5">
              <label htmlFor={name} className="text-xs font-medium text-gray-500">
                {label}
              </label>
              <div className="flex items-stretch border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-shadow overflow-hidden">
                <input
                  id={name}
                  name={name}
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex items-center px-2.5 bg-gray-50 border-l border-gray-200 text-xs text-gray-400 select-none whitespace-nowrap">
                  {unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ผู้ประสานงาน */}
      <section className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">ผู้ประสานงาน</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="coordinator" className="text-sm font-medium text-gray-700">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              id="coordinator"
              name="coordinator"
              placeholder="ชื่อ-นามสกุล"
              className={inputCls}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์
            </label>
            <input
              id="phone"
              name="phone"
              placeholder="0xx-xxx-xxxx"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="p-6 space-y-4">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-gray-900 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'เพิ่มหมู่บ้าน'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
