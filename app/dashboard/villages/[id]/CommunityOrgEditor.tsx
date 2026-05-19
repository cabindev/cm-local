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
  result1: string | null
  result2: string | null
  result3: string | null
}

type RowState = {
  hasParticipation: boolean
  orgNames: string[]
  result1: string
  result2: string
  result3: string
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
    result1: rec?.result1 ?? '',
    result2: rec?.result2 ?? '',
    result3: rec?.result3 ?? '',
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
        result1: row.result1 || undefined,
        result2: row.result2 || undefined,
        result3: row.result3 || undefined,
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

  function setText(key: OrgKey, field: 'result1' | 'result2' | 'result3', value: string) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
    setGlobalSaved(false)
  }

  function handleBlur(key: OrgKey) {
    doSave(key, rows[key])
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

  const inputCls = 'w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'
  const disabledInputCls = `${inputCls} bg-transparent border-transparent text-gray-300 placeholder-gray-200 cursor-default`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <p className="font-bold text-white text-sm">การมีส่วนร่วมของชุมชน</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">หน่วยงานที่มีส่วนร่วม — บันทึกอัตโนมัติ</p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {globalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />}
          {globalSaved && !globalSaving && (
            <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
              <CheckCheck className="w-3.5 h-3.5" />บันทึกแล้ว
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[200px_44px_1fr_1fr_1fr_28px] gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        <span>หน่วยงาน</span>
        <span className="text-center">มี</span>
        <span>ผลปีที่ 1</span>
        <span>ผลปีที่ 2</span>
        <span>ผลปีที่ 3</span>
        <span />
      </div>

      <div className="divide-y divide-gray-100">
        {ORG_ITEMS.map(({ key, label, namePlaceholder }) => {
          const row = rows[key]

          return (
            <div key={key} className={`px-5 py-3 transition-colors ${row.hasParticipation ? 'bg-yellow-50/30' : ''}`}>
              <div className="grid grid-cols-[200px_44px_1fr_1fr_1fr_28px] gap-2 items-center">
                <span className="text-sm font-medium text-gray-800">{label}</span>

                <button type="button" onClick={() => toggleParticipation(key)} className="flex justify-center">
                  {row.hasParticipation
                    ? <CheckSquare className="w-5 h-5 text-yellow-500" />
                    : <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />}
                </button>

                <input value={row.result1} onChange={(e) => setText(key, 'result1', e.target.value)}
                  onBlur={() => handleBlur(key)} placeholder={row.hasParticipation ? 'บันทึกผล...' : '—'}
                  disabled={!row.hasParticipation}
                  className={row.hasParticipation ? inputCls : disabledInputCls} />
                <input value={row.result2} onChange={(e) => setText(key, 'result2', e.target.value)}
                  onBlur={() => handleBlur(key)} placeholder={row.hasParticipation ? 'บันทึกผล...' : '—'}
                  disabled={!row.hasParticipation}
                  className={row.hasParticipation ? inputCls : disabledInputCls} />
                <input value={row.result3} onChange={(e) => setText(key, 'result3', e.target.value)}
                  onBlur={() => handleBlur(key)} placeholder={row.hasParticipation ? 'บันทึกผล...' : '—'}
                  disabled={!row.hasParticipation}
                  className={row.hasParticipation ? inputCls : disabledInputCls} />

                <div className="flex justify-center">
                  {row.saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />}
                  {row.saved  && <CheckCheck className="w-3.5 h-3.5 text-green-500" />}
                </div>
              </div>

              {/* Name list — shows when checked */}
              {row.hasParticipation && (
                <div className="mt-2 ml-[212px] mr-8 space-y-1.5">
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
                <p className="mt-1 ml-[212px] text-xs text-red-500">{row.error}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
