'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { upsertCommunityOrg } from '@/app/actions/health-data'

type OrgRow = { id: number; orgType: string; hasParticipation: boolean; result1: string | null; result2: string | null; result3: string | null }

const ORGS = [
  { type: 'school',        label: 'สถานศึกษา' },
  { type: 'temple',        label: 'วัด/ศาสนาสถาน' },
  { type: 'localGov',      label: 'ท้องถิ่น (อบต./เทศบาล)' },
  { type: 'villageAdmin',  label: 'ท้องที่ (กำนัน/ผู้ใหญ่บ้าน)' },
  { type: 'healthStation', label: 'รพ.สต.' },
  { type: 'organization',  label: 'กลุ่มองค์กร' },
]

export type CommunityOrgTableHandle = { save: () => Promise<void> }

const CommunityOrgTable = forwardRef<CommunityOrgTableHandle, { villageId: number; orgs: OrgRow[] }>(
  function CommunityOrgTable({ villageId, orgs }, ref) {
    const find = (type: string) => orgs.find((o) => o.orgType === type)
    const [rows, setRows] = useState(() =>
      ORGS.map((o) => {
        const saved = find(o.type)
        return { type: o.type, hasParticipation: saved?.hasParticipation ?? false, result1: saved?.result1 ?? '', result2: saved?.result2 ?? '', result3: saved?.result3 ?? '' }
      })
    )

    const update = (type: string, key: string, value: string | boolean) =>
      setRows((prev) => prev.map((r) => r.type === type ? { ...r, [key]: value } : r))

    useImperativeHandle(ref, () => ({
      async save() {
        await Promise.all(rows.map((r) =>
          upsertCommunityOrg(villageId, r.type, { hasParticipation: r.hasParticipation, result1: r.result1 || undefined, result2: r.result2 || undefined, result3: r.result3 || undefined })
        ))
      }
    }), [villageId, rows])

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">การมีส่วนร่วม</p>
          <p className="text-sm font-medium text-white mt-0.5">การมีส่วนร่วมของชุมชน</p>
        </div>

        {/* Mobile: cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {ORGS.map(({ type, label }) => {
            const row = rows.find((r) => r.type === type)!
            return (
              <div key={type} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-400">มี</span>
                    <input type="checkbox" checked={row.hasParticipation}
                      onChange={(e) => update(type, 'hasParticipation', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400" />
                  </label>
                </div>
                {row.hasParticipation && (
                  <div className="space-y-2 pl-1">
                    {(['result1', 'result2', 'result3'] as const).map((rk, ri) => (
                      <div key={rk}>
                        <p className="text-[10px] text-gray-400 mb-1">ผลปีที่ {ri + 1}</p>
                        <input type="text" value={row[rk]} onChange={(e) => update(type, rk, e.target.value)}
                          placeholder="บันทึกผล..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-2.5 font-medium text-gray-400">หน่วยงาน</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-400 w-16">มี</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ผลปีที่ 1</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ผลปีที่ 2</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ผลปีที่ 3</th>
              </tr>
            </thead>
            <tbody>
              {ORGS.map(({ type, label }, i) => {
                const row = rows.find((r) => r.type === type)!
                return (
                  <tr key={type} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === ORGS.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-5 py-3 text-gray-700">{label}</td>
                    <td className="px-4 py-3 text-center">
                      <label className="flex items-center justify-center cursor-pointer p-2 -m-2">
                        <input type="checkbox" checked={row.hasParticipation}
                          onChange={(e) => update(type, 'hasParticipation', e.target.checked)}
                          className="w-4 h-4 accent-yellow-400" />
                      </label>
                    </td>
                    {(['result1', 'result2', 'result3'] as const).map((rk) => (
                      <td key={rk} className="px-4 py-2.5">
                        {row.hasParticipation ? (
                          <input type="text" value={row[rk]} onChange={(e) => update(type, rk, e.target.value)}
                            placeholder="บันทึกผล..."
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

export default CommunityOrgTable
