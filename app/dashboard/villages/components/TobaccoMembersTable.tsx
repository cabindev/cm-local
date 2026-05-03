'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { saveTobaccoMembers } from '@/app/actions/health-data'

type YearKey = 'y1' | 'y2' | 'y3'
const SMOKE_TYPES = ['สูบ', 'ไม่สูบ'] as const
const OUTCOMES = [
  { key: 'Money',    label: 'จำนวนเงินประหยัด',  placeholder: 'ประหยัดได้เท่าไหร่...' },
  { key: 'Property', label: 'ทรัพย์สิน',          placeholder: 'รายละเอียด...' },
  { key: 'Family',   label: 'ความสุขในครอบครัว',  placeholder: 'รายละเอียด...' },
  { key: 'Health',   label: 'สุขภาพ',             placeholder: 'รายละเอียด...' },
  { key: 'Work',     label: 'การทำงาน/อาชีพ',     placeholder: 'รายละเอียด...' },
  { key: 'Accepted', label: 'ได้รับการยอมรับ',    placeholder: 'รายละเอียด...' },
  { key: 'Other',    label: 'อื่นๆ',              placeholder: 'ระบุ...' },
] as const

type Member = {
  id?: number; name: string; smokeType: string
  y1Money: boolean; y1MoneyText: string; y1Property: boolean; y1PropertyText: string
  y1Family: boolean; y1FamilyText: string; y1Health: boolean; y1HealthText: string
  y1Work: boolean; y1WorkText: string; y1Accepted: boolean; y1AcceptedText: string
  y1Other: boolean; y1OtherText: string
  y2Money: boolean; y2MoneyText: string; y2Property: boolean; y2PropertyText: string
  y2Family: boolean; y2FamilyText: string; y2Health: boolean; y2HealthText: string
  y2Work: boolean; y2WorkText: string; y2Accepted: boolean; y2AcceptedText: string
  y2Other: boolean; y2OtherText: string
  y3Money: boolean; y3MoneyText: string; y3Property: boolean; y3PropertyText: string
  y3Family: boolean; y3FamilyText: string; y3Health: boolean; y3HealthText: string
  y3Work: boolean; y3WorkText: string; y3Accepted: boolean; y3AcceptedText: string
  y3Other: boolean; y3OtherText: string
}

const emptyMember = (): Member => ({
  name: '', smokeType: 'สูบ',
  y1Money: false, y1MoneyText: '', y1Property: false, y1PropertyText: '',
  y1Family: false, y1FamilyText: '', y1Health: false, y1HealthText: '',
  y1Work: false, y1WorkText: '', y1Accepted: false, y1AcceptedText: '',
  y1Other: false, y1OtherText: '',
  y2Money: false, y2MoneyText: '', y2Property: false, y2PropertyText: '',
  y2Family: false, y2FamilyText: '', y2Health: false, y2HealthText: '',
  y2Work: false, y2WorkText: '', y2Accepted: false, y2AcceptedText: '',
  y2Other: false, y2OtherText: '',
  y3Money: false, y3MoneyText: '', y3Property: false, y3PropertyText: '',
  y3Family: false, y3FamilyText: '', y3Health: false, y3HealthText: '',
  y3Work: false, y3WorkText: '', y3Accepted: false, y3AcceptedText: '',
  y3Other: false, y3OtherText: '',
})

function OutcomeCell({ year, member, onChange }: { year: YearKey; member: Member; onChange: (f: keyof Member, v: boolean | string) => void }) {
  return (
    <div className="space-y-0.5 min-w-[160px]">
      {OUTCOMES.map(({ key, label, placeholder }) => {
        const checkField = `${year}${key}` as keyof Member
        const textField = `${year}${key}Text` as keyof Member
        const checked = member[checkField] as boolean
        return (
          <div key={key}>
            <label className="flex items-start gap-2 py-1 cursor-pointer">
              <input type="checkbox" checked={checked} onChange={(e) => onChange(checkField, e.target.checked)} className="w-4 h-4 mt-0.5 accent-yellow-400 flex-shrink-0" />
              <span className="text-xs text-gray-700">{label}</span>
            </label>
            {checked && (
              <input type="text" value={member[textField] as string} onChange={(e) => onChange(textField, e.target.value)}
                placeholder={placeholder}
                className="mt-1 ml-6 w-[calc(100%-1.5rem)] px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export type TobaccoMembersTableHandle = { save: () => Promise<void> }

const TobaccoMembersTable = forwardRef<TobaccoMembersTableHandle, { villageId: number; initial: Member[] }>(
  function TobaccoMembersTable({ villageId, initial }, ref) {
    const [members, setMembers] = useState<Member[]>(initial.length > 0 ? initial : [emptyMember()])

    const update = (index: number, field: keyof Member, value: boolean | string) =>
      setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
    const addRow = () => setMembers((prev) => [...prev, emptyMember()])
    const removeRow = (index: number) => setMembers((prev) => prev.filter((_, i) => i !== index))

    useImperativeHandle(ref, () => ({
      async save() {
        const payload = members.map((m) => {
          const cleaned: Record<string, unknown> = { ...m }
          for (const key of Object.keys(cleaned)) if (key.endsWith('Text') && cleaned[key] === '') cleaned[key] = undefined
          return cleaned as Member & { id?: number }
        })
        await saveTobaccoMembers(villageId, payload)
      }
    }), [villageId, members])

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผู้สมัคร</p>
          <p className="text-sm font-medium text-white mt-0.5">รายชื่อผู้สมัครเข้าร่วมงดบุหรี่</p>
        </div>

        {/* Mobile: card per member */}
        <div className="sm:hidden divide-y divide-gray-100">
          {members.map((member, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-xs w-5 flex-shrink-0">{i + 1}</span>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => update(i, 'name', e.target.value)}
                  placeholder="ชื่อ-นามสกุล"
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white"
                />
                <select
                  value={member.smokeType}
                  onChange={(e) => update(i, 'smokeType', e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white flex-shrink-0"
                >
                  {SMOKE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0">✕</button>
              </div>
              {(['y1', 'y2', 'y3'] as YearKey[]).map((year, yi) => (
                <div key={year} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">ผลที่เกิดขึ้น ปีที่ {yi + 1}</div>
                  <div className="px-3 py-2">
                    <OutcomeCell year={year} member={member} onChange={(f, v) => update(i, f, v)} />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="px-4 py-3">
            <button onClick={addRow} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">+ เพิ่มรายชื่อ</button>
          </div>
        </div>

        {/* Desktop: horizontal table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 w-8">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[140px]">ชื่อ</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[100px]">ประเภทการสูบ</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[180px]">ผลที่เกิดขึ้น ปีที่ 1</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[180px]">ผลที่เกิดขึ้น ปีที่ 2</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[180px]">ผลที่เกิดขึ้น ปีที่ 3</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <tr key={i} className="border-b border-gray-50 align-top hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <input type="text" value={member.name} onChange={(e) => update(i, 'name', e.target.value)}
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={member.smokeType} onChange={(e) => update(i, 'smokeType', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white">
                      {SMOKE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  {(['y1', 'y2', 'y3'] as YearKey[]).map((year) => (
                    <td key={year} className="px-4 py-3">
                      <OutcomeCell year={year} member={member} onChange={(f, v) => update(i, f, v)} />
                    </td>
                  ))}
                  <td className="px-2 py-3">
                    <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors p-1">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100">
            <button onClick={addRow} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">+ เพิ่มรายชื่อ</button>
          </div>
        </div>
      </div>
    )
  }
)

export default TobaccoMembersTable
