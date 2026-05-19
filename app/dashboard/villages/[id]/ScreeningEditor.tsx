'use client'

import { useState, useTransition } from 'react'
import { upsertScreeningResult } from '@/app/actions/village-data'
import { Loader2, CheckCheck } from 'lucide-react'

type ScreeningData = {
  screenedCount: number
  alcoholRiskLow: number
  alcoholRisk: number
  alcoholDanger: number
  alcoholAddicted: number
  alcoholNone: number
  tobaccoCount: number
  tobaccoNone: number
  drinkAndDrive: number
  drinkNotDriveN: number
}

const DEFAULT: ScreeningData = {
  screenedCount: 0, alcoholRiskLow: 0, alcoholRisk: 0, alcoholDanger: 0,
  alcoholAddicted: 0, alcoholNone: 0, tobaccoCount: 0, tobaccoNone: 0,
  drinkAndDrive: 0, drinkNotDriveN: 0,
}

function InputRow({
  label, value, onChange, onBlur,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  onBlur: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 px-4">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="number"
        min="0"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        onBlur={onBlur}
        className="w-20 text-right px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
      />
    </div>
  )
}

function CalcFooter({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div className={`${color} px-4 py-3`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="text-xs opacity-60 mt-0.5">คำนวณจากตัวเลขคัดกรอง {total} คน</p>
      <p className="text-2xl font-black mt-1">{Math.max(0, value).toLocaleString()} <span className="text-sm font-normal">คน</span></p>
    </div>
  )
}

export default function ScreeningEditor({
  villageId,
  initial,
}: {
  villageId: number
  initial: ScreeningData | null
}) {
  const [data, setData] = useState<ScreeningData>(initial ?? DEFAULT)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(!!initial)

  function set(key: keyof ScreeningData, value: number) {
    setData((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function save(current: ScreeningData) {
    const totalAlcohol = current.alcoholRiskLow + current.alcoholRisk + current.alcoholDanger + current.alcoholAddicted
    startTransition(async () => {
      await upsertScreeningResult(villageId, {
        ...current,
        alcoholNone: Math.max(0, current.screenedCount - totalAlcohol),
        tobaccoNone: Math.max(0, current.screenedCount - current.tobaccoCount),
      })
      setSaved(true)
      // saved stays until the user edits again — no auto-clear
    })
  }

  const totalAlcohol = data.alcoholRiskLow + data.alcoholRisk + data.alcoholDanger + data.alcoholAddicted
  const alcoholNone = data.screenedCount - totalAlcohol
  const tobaccoNone = data.screenedCount - data.tobaccoCount
  const dndNone = data.screenedCount - data.drinkAndDrive - data.drinkNotDriveN

  const handleBlur = () => save(data)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-5 py-4 flex items-start justify-between">
        <div>
          <p className="font-bold text-white text-sm">ผลคัดกรอง</p>
          <p className="text-xs text-gray-400 mt-0.5">ผลการคัดกรองประชากร — บันทึกอัตโนมัติ</p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />}
          {saved && !isPending && (
            <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
              <CheckCheck className="w-3.5 h-3.5" />บันทึกแล้ว
            </span>
          )}
        </div>
      </div>

      {/* Screened total */}
      <div className="flex flex-col items-center py-5 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-2">จำนวนคนคัดกรองทั้งหมด</p>
        <div className="flex items-baseline gap-3">
          <input
            type="number"
            min="0"
            value={data.screenedCount === 0 ? '' : data.screenedCount}
            placeholder="0"
            onChange={(e) => set('screenedCount', parseInt(e.target.value) || 0)}
            onBlur={handleBlur}
            className="w-28 text-center px-3 py-2 border border-gray-200 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <span className="text-3xl font-black text-gray-900">{data.screenedCount.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">คน</span>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">

        {/* Alcohol */}
        <div>
          <div className="bg-yellow-400 px-4 py-3">
            <p className="font-bold text-gray-900 text-sm">กลุ่มแอลกอฮอล์</p>
          </div>
          <InputRow label="จำนวนคนดื่มแบบเสี่ยงต่ำ"   value={data.alcoholRiskLow}  onChange={(v) => set('alcoholRiskLow', v)}  onBlur={handleBlur} />
          <InputRow label="จำนวนคนที่ดื่มแบบเสี่ยง"   value={data.alcoholRisk}     onChange={(v) => set('alcoholRisk', v)}     onBlur={handleBlur} />
          <InputRow label="จำนวนคนที่ดื่มแบบอันตราย"  value={data.alcoholDanger}   onChange={(v) => set('alcoholDanger', v)}   onBlur={handleBlur} />
          <InputRow label="จำนวนคนที่ดื่มแบบติด"      value={data.alcoholAddicted} onChange={(v) => set('alcoholAddicted', v)} onBlur={handleBlur} />
          <CalcFooter label="จำนวนคนที่ไม่ดื่ม" value={alcoholNone} total={data.screenedCount} color="bg-yellow-50 text-yellow-900" />
        </div>

        {/* Tobacco */}
        <div>
          <div className="bg-yellow-600 px-4 py-3">
            <p className="font-bold text-white text-sm">กลุ่มบุหรี่</p>
          </div>
          <InputRow label="จำนวนคนสูบ" value={data.tobaccoCount} onChange={(v) => set('tobaccoCount', v)} onBlur={handleBlur} />
          <CalcFooter label="จำนวนคนไม่สูบ" value={tobaccoNone} total={data.screenedCount} color="bg-yellow-50 text-yellow-900" />
        </div>

        {/* DND */}
        <div>
          <div className="bg-gray-800 px-4 py-3">
            <p className="font-bold text-white text-sm">กลุ่มการขับขี่หลังดื่ม</p>
          </div>
          <InputRow label="จำนวนคนดื่มแล้วขับ" value={data.drinkAndDrive}  onChange={(v) => set('drinkAndDrive', v)}  onBlur={handleBlur} />
          <InputRow label="จำนวนคนดื่มไม่ขับ"  value={data.drinkNotDriveN} onChange={(v) => set('drinkNotDriveN', v)} onBlur={handleBlur} />
          <CalcFooter label="จำนวนคนที่ไม่ดื่ม (ไม่มีความเสี่ยง)" value={dndNone} total={data.screenedCount} color="bg-yellow-50 text-yellow-900" />
        </div>
      </div>
    </div>
  )
}
