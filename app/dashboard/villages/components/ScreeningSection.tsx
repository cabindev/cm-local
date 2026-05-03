'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { upsertScreening } from '@/app/actions/health-data'

type ScreeningRow = {
  id: number; year: number; screenedCount: number; alcoholRiskLow: number
  alcoholRisk: number; alcoholDanger: number; alcoholAddicted: number
  alcoholNone: number; tobaccoCount: number; tobaccoNone: number
  drinkAndDrive: number; drinkNotDriveN: number
}

const ROWS = [
  { key: 'screenedCount',   label: 'จำนวนคนคัดกรอง' },
  { key: 'alcoholRiskLow',  label: 'ดื่มแบบเสี่ยงต่ำ' },
  { key: 'alcoholRisk',     label: 'ดื่มแบบเสี่ยง' },
  { key: 'alcoholDanger',   label: 'ดื่มแบบอันตราย' },
  { key: 'alcoholAddicted', label: 'ดื่มแบบติด' },
  { key: 'alcoholNone',     label: 'ไม่ดื่มแอลกอฮอล์' },
  { key: 'tobaccoCount',    label: 'สูบบุหรี่' },
  { key: 'tobaccoNone',     label: 'ไม่สูบบุหรี่' },
  { key: 'drinkAndDrive',   label: 'ดื่มแล้วขับ' },
  { key: 'drinkNotDriveN',  label: 'ดื่มไม่ขับ' },
] as const

type FieldKey = typeof ROWS[number]['key']

const empty = (): Record<FieldKey, number> => ({
  screenedCount: 0, alcoholRiskLow: 0, alcoholRisk: 0, alcoholDanger: 0,
  alcoholAddicted: 0, alcoholNone: 0, tobaccoCount: 0, tobaccoNone: 0,
  drinkAndDrive: 0, drinkNotDriveN: 0,
})

const fromRow = (r: ScreeningRow | undefined): Record<FieldKey, number> =>
  r ? {
    screenedCount: r.screenedCount, alcoholRiskLow: r.alcoholRiskLow,
    alcoholRisk: r.alcoholRisk, alcoholDanger: r.alcoholDanger,
    alcoholAddicted: r.alcoholAddicted, alcoholNone: r.alcoholNone,
    tobaccoCount: r.tobaccoCount, tobaccoNone: r.tobaccoNone,
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

    useImperativeHandle(ref, () => ({
      async save() {
        await upsertScreening(villageId, 1, fields)
      }
    }), [villageId, fields])

    const alcoholSum = fields.alcoholRiskLow + fields.alcoholRisk + fields.alcoholDanger + fields.alcoholAddicted + fields.alcoholNone
    const tobaccoSum = fields.tobaccoCount + fields.tobaccoNone
    const showAlcWarning = fields.screenedCount > 0 && alcoholSum !== fields.screenedCount
    const showTobWarning = fields.screenedCount > 0 && tobaccoSum !== fields.screenedCount

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผลคัดกรอง</p>
          <p className="text-sm font-medium text-white mt-0.5">ผลการคัดกรองประชากร</p>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 font-medium text-gray-400">รายการ</th>
              <th className="text-left px-5 py-2.5 font-medium text-gray-400 w-44">จำนวน (คน)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label }, i) => (
              <>
                <tr key={key} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === ROWS.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-5 py-3 text-gray-700">{label}</td>
                  <td className="px-5 py-2.5">
                    <input
                      type="number" min={0} value={fields[key] || ''} placeholder="0"
                      onChange={(e) => set(key, Number(e.target.value))}
                      className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-right bg-gray-50 focus:bg-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                    />
                  </td>
                </tr>
                {key === 'alcoholNone' && showAlcWarning && (
                  <tr key="alc-warning" className="bg-orange-50">
                    <td colSpan={2} className="px-5 py-1.5 text-orange-600 text-[10px]">
                      ⚠ รวมแอลกอฮอล์ {alcoholSum} คน ≠ จำนวนคัดกรอง {fields.screenedCount} คน
                    </td>
                  </tr>
                )}
                {key === 'tobaccoNone' && showTobWarning && (
                  <tr key="tob-warning" className="bg-orange-50">
                    <td colSpan={2} className="px-5 py-1.5 text-orange-600 text-[10px]">
                      ⚠ รวมบุหรี่ {tobaccoSum} คน ≠ จำนวนคัดกรอง {fields.screenedCount} คน
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    )
  }
)

export default ScreeningSection
