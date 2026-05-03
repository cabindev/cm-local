'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { upsertScreening } from '@/app/actions/health-data'

type ScreeningRow = {
  id: number; year: number; screenedCount: number; alcoholRiskLow: number
  alcoholRisk: number; alcoholDanger: number; alcoholAddicted: number
  alcoholNone: number; tobaccoCount: number; tobaccoNone: number
  drinkAndDrive: number; drinkNotDriveN: number
}

type FieldKey = 'screenedCount' | 'alcoholRiskLow' | 'alcoholRisk' | 'alcoholDanger' | 'alcoholAddicted'
  | 'tobaccoCount' | 'drinkAndDrive' | 'drinkNotDriveN'

const empty = (): Record<FieldKey, number> => ({
  screenedCount: 0, alcoholRiskLow: 0, alcoholRisk: 0, alcoholDanger: 0,
  alcoholAddicted: 0, tobaccoCount: 0, drinkAndDrive: 0, drinkNotDriveN: 0,
})

const fromRow = (r: ScreeningRow | undefined): Record<FieldKey, number> =>
  r ? {
    screenedCount: r.screenedCount, alcoholRiskLow: r.alcoholRiskLow,
    alcoholRisk: r.alcoholRisk, alcoholDanger: r.alcoholDanger,
    alcoholAddicted: r.alcoholAddicted, tobaccoCount: r.tobaccoCount,
    drinkAndDrive: r.drinkAndDrive, drinkNotDriveN: r.drinkNotDriveN,
  } : empty()

export type ScreeningSectionHandle = { save: () => Promise<void> }

const ScreeningSection = forwardRef<ScreeningSectionHandle, { villageId: number; screeningResults: ScreeningRow[] }>(
  function ScreeningSection({ villageId, screeningResults }, ref) {
    const [fields, setFields] = useState<Record<FieldKey, number>>(
      () => fromRow(screeningResults.find((r) => r.year === 1))
    )

    const set = (key: FieldKey, val: number) =>
      setFields((prev) => ({ ...prev, [key]: val }))

    const n = fields.screenedCount

    const alcoholSum = fields.alcoholRiskLow + fields.alcoholRisk + fields.alcoholDanger + fields.alcoholAddicted
    const alcoholNormal = Math.max(0, n - alcoholSum)

    const tobaccoNormal = Math.max(0, n - fields.tobaccoCount)

    const driveSum = fields.drinkAndDrive + fields.drinkNotDriveN
    const driveNormal = Math.max(0, n - driveSum)

    useImperativeHandle(ref, () => ({
      async save() {
        await upsertScreening(villageId, 1, {
          ...fields,
          alcoholNone: alcoholNormal,
          tobaccoNone: tobaccoNormal,
          drinkNotDriveN: fields.drinkNotDriveN,
        })
      }
    }), [villageId, fields, alcoholNormal, tobaccoNormal])

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผลคัดกรอง</p>
          <p className="text-sm font-medium text-white mt-0.5">ผลการคัดกรองประชากร</p>
        </div>

        {/* จำนวนคัดกรอง */}
        <div className="px-5 py-5 border-b border-gray-100 flex flex-col items-center gap-2 bg-gray-50">
          <p className="text-xs text-gray-400">จำนวนคนคัดกรองทั้งหมด</p>
          <div className="flex items-center gap-3">
            <NumInput value={fields.screenedCount} onChange={(v) => set('screenedCount', v)} accent="yellow" />
            <p className="text-2xl font-bold text-gray-900">
              {n > 0 ? n.toLocaleString() : '—'}
              <span className="text-sm font-normal text-gray-400 ml-1">คน</span>
            </p>
          </div>
        </div>

        {/* สามกลุ่มแบบ card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

          {/* ── การ์ดแอลกอฮอล์ ── */}
          <div className="flex flex-col">
            <div className="bg-orange-400 px-4 py-3">
              <p className="text-xs font-bold text-white">กลุ่มแอลกอฮอล์</p>
            </div>
            <div className="flex-1 divide-y divide-orange-100">
              {([
                ['alcoholRiskLow',  'จำนวนคนดื่มแบบเสี่ยงต่ำ'],
                ['alcoholRisk',     'จำนวนคนที่ดื่มแบบเสี่ยง'],
                ['alcoholDanger',   'จำนวนคนที่ดื่มแบบอันตราย'],
                ['alcoholAddicted', 'จำนวนคนที่ดื่มแบบติด'],
              ] as [FieldKey, string][]).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between px-4 py-2.5 bg-orange-50 hover:bg-orange-100 transition-colors">
                  <span className="text-xs text-orange-900">{label}</span>
                  <NumInput value={fields[key]} onChange={(v) => set(key, v)} accent="orange" />
                </div>
              ))}
            </div>
            <CalcFooter
              label="จำนวนคนที่ไม่ดื่ม"
              screenedCount={n}
              normal={alcoholNormal}
              over={alcoholSum > n && n > 0}
              bgClass="bg-orange-100"
              textClass="text-orange-700"
            />
          </div>

          {/* ── การ์ดบุหรี่ ── */}
          <div className="flex flex-col">
            <div className="bg-slate-500 px-4 py-3">
              <p className="text-xs font-bold text-white">กลุ่มบุหรี่</p>
            </div>
            <div className="flex-1 divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-xs text-slate-800">จำนวนคนสูบ</span>
                <NumInput value={fields.tobaccoCount} onChange={(v) => set('tobaccoCount', v)} accent="slate" />
              </div>
              <div className="flex-1 bg-slate-50" />
            </div>
            <CalcFooter
              label="จำนวนคนไม่สูบ"
              screenedCount={n}
              normal={tobaccoNormal}
              over={fields.tobaccoCount > n && n > 0}
              bgClass="bg-slate-100"
              textClass="text-slate-600"
            />
          </div>

          {/* ── การ์ดขับขี่ ── */}
          <div className="flex flex-col">
            <div className="bg-teal-500 px-4 py-3">
              <p className="text-xs font-bold text-white">กลุ่มการขับขี่หลังดื่ม</p>
            </div>
            <div className="flex-1 divide-y divide-teal-100">
              {([
                ['drinkAndDrive',  'จำนวนคนดื่มแล้วขับ'],
                ['drinkNotDriveN', 'จำนวนคนดื่มไม่ขับ'],
              ] as [FieldKey, string][]).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between px-4 py-2.5 bg-teal-50 hover:bg-teal-100 transition-colors">
                  <span className="text-xs text-teal-900">{label}</span>
                  <NumInput value={fields[key]} onChange={(v) => set(key, v)} accent="teal" />
                </div>
              ))}
              <div className="flex-1 bg-teal-50" />
            </div>
            <CalcFooter
              label="จำนวนคนที่ไม่ดื่ม (ไม่มีความเสี่ยง)"
              screenedCount={n}
              normal={driveNormal}
              over={driveSum > n && n > 0}
              bgClass="bg-teal-100"
              textClass="text-teal-700"
            />
          </div>

        </div>
      </div>
    )
  }
)

function CalcFooter({
  label, screenedCount, normal, over, bgClass, textClass,
}: {
  label: string; screenedCount: number; normal: number; over: boolean; bgClass: string; textClass: string
}) {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 ${bgClass}`}>
      <p className={`text-xs font-medium ${textClass}`}>{label}</p>
      <p className={`text-[10px] italic ${textClass} opacity-60 mt-0.5`}>
        คำนวณจากตัวเลขคัดกรอง {screenedCount > 0 ? `${screenedCount.toLocaleString()} คน` : '—'}
      </p>
      <p className={`text-lg font-bold mt-1 ${over ? 'text-red-600' : textClass}`}>
        {screenedCount === 0 ? '—' : over ? 'เกินจำนวน' : `${normal.toLocaleString()} คน`}
      </p>
    </div>
  )
}

function NumInput({ value, onChange, accent }: { value: number; onChange: (v: number) => void; accent: 'orange' | 'slate' | 'teal' | 'yellow' }) {
  const ring = {
    orange: 'focus:border-orange-400 focus:ring-orange-300',
    slate:  'focus:border-slate-400 focus:ring-slate-300',
    teal:   'focus:border-teal-400 focus:ring-teal-300',
    yellow: 'focus:border-yellow-400 focus:ring-yellow-300',
  }[accent]
  return (
    <input
      type="number" min={0} value={value || ''} placeholder="0"
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right bg-white focus:outline-none focus:ring-1 transition-colors ${ring}`}
    />
  )
}

export default ScreeningSection
