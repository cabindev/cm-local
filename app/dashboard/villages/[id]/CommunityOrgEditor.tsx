'use client'

import { useState } from 'react'
import { upsertCommunityOrg } from '@/app/actions/village-data'
import { Users, CheckSquare, Square, Loader2, CheckCheck, Plus, X } from 'lucide-react'

const ORG_ITEMS = [
  { key: 'school',       label: 'สถานศึกษา',                   namePlaceholder: 'ชื่อสถานศึกษา' },
  { key: 'temple',       label: 'วัด/ศาสนสถาน',                namePlaceholder: 'ชื่อวัด/ศาสนสถาน' },
  { key: 'localAdmin',   label: 'ท้องถิ่น (อบต./เทศบาล)',       namePlaceholder: 'ชื่อหน่วยงาน' },
  { key: 'villageAdmin', label: 'ท้องที่ (กำนัน/ผู้ใหญ่บ้าน)', namePlaceholder: 'ชื่อกำนัน/ผู้ใหญ่บ้าน' },
  { key: 'hospital',     label: 'รพ.สต.',                       namePlaceholder: 'ชื่อ รพ.สต.' },
  { key: 'orgGroup',     label: 'กลุ่มองค์กร',                  namePlaceholder: 'ชื่อกลุ่มองค์กร' },
] as const

type OrgKey = typeof ORG_ITEMS[number]['key']

type OrgRecord = {
  orgType: string
  hasParticipation: boolean
  orgNames: string | null
}

type RowState = {
  hasParticipation: boolean
  orgNames: string[]
  saving: boolean
  saved: boolean
  error: string
}

function parseJson(s: string | null): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

function initRow(rec: OrgRecord | undefined): RowState {
  return {
    hasParticipation: rec?.hasParticipation ?? false,
    orgNames: parseJson(rec?.orgNames ?? null),
    saving: false,
    saved: false,
    error: '',
  }
}

export default function CommunityOrgEditor({
  villageId,
  initial,
}: {
  villageId: number
  initial: OrgRecord[]
}) {
  const initMap = Object.fromEntries(initial.map((r) => [r.orgType, r]))
  const [rows, setRows] = useState<Record<OrgKey, RowState>>(
    Object.fromEntries(ORG_ITEMS.map(({ key }) => [key, initRow(initMap[key])])) as Record<OrgKey, RowState>
  )

  const [globalSaving, setGlobalSaving] = useState(false)
  const [globalSaved,  setGlobalSaved]  = useState(initial.length > 0)

  async function doSave(key: OrgKey, row: RowState) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], saving: true, error: '', saved: false } }))
    setGlobalSaving(true)
    try {
      await upsertCommunityOrg(villageId, key, {
        hasParticipation: row.hasParticipation,
        orgNames: row.orgNames,
      })
      setRows((prev) => ({ ...prev, [key]: { ...prev[key], saving: false, saved: true } }))
      setTimeout(() => setRows((prev) => ({ ...prev, [key]: { ...prev[key], saved: false } })), 2000)
      setGlobalSaved(true)
    } catch {
      setRows((prev) => ({ ...prev, [key]: { ...prev[key], saving: false, error: 'บันทึกไม่สำเร็จ' } }))
    } finally {
      setGlobalSaving(false)
    }
  }

  function toggleParticipation(key: OrgKey) {
    const updated = { ...rows[key], hasParticipation: !rows[key].hasParticipation }
    setRows((prev) => ({ ...prev, [key]: updated }))
    doSave(key, updated)
  }

  function addName(key: OrgKey) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], orgNames: [...prev[key].orgNames, ''] } }))
  }

  function updateName(key: OrgKey, i: number, value: string) {
    const newList = [...rows[key].orgNames]
    newList[i] = value
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], orgNames: newList } }))
    setGlobalSaved(false)
  }

  function blurName(key: OrgKey) {
    doSave(key, rows[key])
  }

  function removeName(key: OrgKey, i: number) {
    const newList = rows[key].orgNames.filter((_, idx) => idx !== i)
    const updated = { ...rows[key], orgNames: newList }
    setRows((prev) => ({ ...prev, [key]: updated }))
    doSave(key, updated)
  }

  const inputCls = 'w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-500" />
            <p className="font-semibold text-gray-900 text-sm">การมีส่วนร่วมของชุมชน</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">หน่วยงานที่มีส่วนร่วม — บันทึกอัตโนมัติ</p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {globalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />}
          {globalSaved && !globalSaving && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCheck className="w-3.5 h-3.5" />บันทึกแล้ว
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {ORG_ITEMS.map(({ key, label, namePlaceholder }) => {
          const row = rows[key]

          return (
            <div key={key} className={`px-5 py-3 transition-colors ${row.hasParticipation ? 'bg-yellow-50/30' : ''}`}>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleParticipation(key)} className="flex-shrink-0">
                  {row.hasParticipation
                    ? <CheckSquare className="w-5 h-5 text-yellow-500" />
                    : <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />}
                </button>
                <span className={`text-sm font-normal flex-1 ${row.hasParticipation ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
                <div className="w-5 flex justify-center">
                  {row.saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />}
                  {row.saved  && <CheckCheck className="w-3.5 h-3.5 text-green-500" />}
                </div>
              </div>

              {/* Name list — shows when checked */}
              {row.hasParticipation && (
                <div className="mt-2 ml-8 space-y-1.5">
                  {row.orgNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        value={name}
                        onChange={(e) => updateName(key, i, e.target.value)}
                        onBlur={() => blurName(key)}
                        placeholder={namePlaceholder}
                        className={`${inputCls} text-xs`}
                      />
                      <button type="button" onClick={() => removeName(key, i)}
                        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button type="button" onClick={() => addName(key)}
                    className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                    <Plus className="w-3 h-3" />เพิ่ม{namePlaceholder}
                  </button>
                </div>
              )}

              {row.error && (
                <p className="mt-1 ml-8 text-xs text-red-500">{row.error}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
