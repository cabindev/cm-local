'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { saveDrinkNotDriveMembers } from '@/app/actions/health-data'

const DRINK_TYPES = ['ดื่มแล้วขับ', 'ดื่มไม่ขับ', 'ไม่ดื่ม'] as const

type Member = { id?: number; name: string; drinkType: string; year1Result: string; year2Result: string; year3Result: string }
const emptyMember = (): Member => ({ name: '', drinkType: 'ดื่มไม่ขับ', year1Result: '', year2Result: '', year3Result: '' })

export type DrinkNotDriveMembersTableHandle = { save: () => Promise<void> }

const DrinkNotDriveMembersTable = forwardRef<DrinkNotDriveMembersTableHandle, { villageId: number; initial: Member[] }>(
  function DrinkNotDriveMembersTable({ villageId, initial }, ref) {
    const [members, setMembers] = useState<Member[]>(initial.length > 0 ? initial : [emptyMember()])

    const update = (index: number, field: keyof Member, value: string) =>
      setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
    const addRow = () => setMembers((prev) => [...prev, emptyMember()])
    const removeRow = (index: number) => setMembers((prev) => prev.filter((_, i) => i !== index))

    useImperativeHandle(ref, () => ({
      async save() {
        await saveDrinkNotDriveMembers(villageId, members.map((m) => ({
          ...m,
          year1Result: m.year1Result || undefined,
          year2Result: m.year2Result || undefined,
          year3Result: m.year3Result || undefined,
        })))
      }
    }), [villageId, members])

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผู้ตั้งใจ</p>
          <p className="text-sm font-medium text-white mt-0.5">รายชื่อผู้ที่ตั้งใจดื่มไม่ขับ</p>
        </div>

        {/* Mobile: cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {members.map((member, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
                <input type="text" value={member.name} onChange={(e) => update(i, 'name', e.target.value)}
                  placeholder="ชื่อ-นามสกุล"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
                <select value={member.drinkType} onChange={(e) => update(i, 'drinkType', e.target.value)}
                  className="px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white">
                  {DRINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors text-sm p-1 flex-shrink-0">✕</button>
              </div>
              {(['year1Result', 'year2Result', 'year3Result'] as const).map((field, yi) => (
                <div key={field}>
                  <p className="text-[10px] text-gray-400 mb-1">ผลที่เกิดขึ้น ปีที่ {yi + 1}</p>
                  <textarea value={member[field]} onChange={(e) => update(i, field, e.target.value)}
                    placeholder="กรอกหรือไม่ก็ได้..." rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white resize-none" />
                </div>
              ))}
            </div>
          ))}
          <div className="px-4 py-3">
            <button onClick={addRow} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">+ เพิ่มรายชื่อ</button>
          </div>
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 w-8">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ชื่อ</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[120px]">ประเภทการดื่ม</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[180px]">ผลที่เกิดขึ้น ปีที่ 1</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[180px]">ผลที่เกิดขึ้น ปีที่ 2</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[180px]">ผลที่เกิดขึ้น ปีที่ 3</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <input type="text" value={member.name} onChange={(e) => update(i, 'name', e.target.value)}
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={member.drinkType} onChange={(e) => update(i, 'drinkType', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white">
                      {DRINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  {(['year1Result', 'year2Result', 'year3Result'] as const).map((field) => (
                    <td key={field} className="px-4 py-3">
                      <textarea value={member[field]} onChange={(e) => update(i, field, e.target.value)}
                        placeholder="กรอกหรือไม่ก็ได้..." rows={2}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white resize-none" />
                    </td>
                  ))}
                  <td className="px-2 py-3">
                    <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
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

export default DrinkNotDriveMembersTable
