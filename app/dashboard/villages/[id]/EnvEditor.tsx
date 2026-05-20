'use client'

import { useState } from 'react'
import { upsertEnvItem } from '@/app/actions/village-data'
import {
  Leaf, CheckSquare, Square, Plus, X,
  Loader2, CheckCheck, Upload, FileCheck, AlertCircle,
} from 'lucide-react'

const ENV_ITEMS = [
  { key: 'funeral',     label: 'งานศพปลอดเหล้า' },
  { key: 'tradition',   label: 'งานประเพณีปลอดเหล้า' },
  { key: 'shop',        label: 'ร้านค้า' },
  { key: 'nodrinkzone', label: 'สถานที่ห้ามดื่มห้ามขาย' },
] as const

type EnvItemKey = typeof ENV_ITEMS[number]['key']

type EnvRecord = {
  itemType: string
  hasItem: boolean
  hasPolicy: boolean | null
  policyFileUrl: string | null
  policyFileName: string | null
  hasCommunityRule: boolean | null
  communityRuleFileUrl: string | null
  communityRuleFileName: string | null
  hasTraditionEvent: boolean | null
  traditionEventNames: string | null
  hasNoDrinkSite: boolean | null
  noDrinkSiteNames: string | null
  noAlcohol: boolean | null
  shopNames: string | null
  hasShopLegal: boolean | null
  shopLegalNames: string | null
}

type RowState = {
  hasItem: boolean
  hasPolicy: boolean
  policyFileUrl: string | null
  policyFileName: string | null
  policyUploading: boolean
  hasCommunityRule: boolean
  crFileUrl: string | null
  crFileName: string | null
  crUploading: boolean
  hasTraditionEvent: boolean
  traditionEventNames: string[]
  hasNoDrinkSite: boolean
  noDrinkSiteNames: string[]
  noAlcohol: boolean
  shopNames: string[]
  hasShopLegal: boolean
  shopLegalNames: string[]
  saving: boolean
  saved: boolean
  error: string
}

function parseJson(s: string | null): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

function initRow(rec: EnvRecord | undefined): RowState {
  return {
    hasItem: rec?.hasItem ?? false,
    hasPolicy: rec?.hasPolicy ?? false,
    policyFileUrl: rec?.policyFileUrl ?? null,
    policyFileName: rec?.policyFileName ?? null,
    policyUploading: false,
    hasCommunityRule: rec?.hasCommunityRule ?? false,
    crFileUrl: rec?.communityRuleFileUrl ?? null,
    crFileName: rec?.communityRuleFileName ?? null,
    crUploading: false,
    hasTraditionEvent: rec?.hasTraditionEvent ?? false,
    traditionEventNames: parseJson(rec?.traditionEventNames ?? null),
    hasNoDrinkSite: rec?.hasNoDrinkSite ?? false,
    noDrinkSiteNames: parseJson(rec?.noDrinkSiteNames ?? null),
    noAlcohol: rec?.noAlcohol ?? false,
    shopNames: parseJson(rec?.shopNames ?? null),
    hasShopLegal: rec?.hasShopLegal ?? false,
    shopLegalNames: parseJson(rec?.shopLegalNames ?? null),
    saving: false,
    saved: false,
    error: '',
  }
}

export default function EnvEditor({
  villageId,
  initial,
}: {
  villageId: number
  initial: EnvRecord[]
}) {
  const initMap = Object.fromEntries(initial.map((r) => [r.itemType, r]))
  const [rows, setRows] = useState<Record<EnvItemKey, RowState>>(
    Object.fromEntries(ENV_ITEMS.map(({ key }) => [key, initRow(initMap[key])])) as Record<EnvItemKey, RowState>
  )

  const [globalSaving, setGlobalSaving] = useState(false)
  const [globalSaved,  setGlobalSaved]  = useState(initial.length > 0)

  function patch(key: EnvItemKey, p: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }))
  }

  async function doSave(key: EnvItemKey, row: RowState) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], saving: true, error: '', saved: false } }))
    setGlobalSaving(true)
    try {
      await upsertEnvItem(villageId, key, {
        hasItem: row.hasItem,
        hasPolicy: row.hasPolicy,
        hasCommunityRule: row.hasCommunityRule,
        hasTraditionEvent: row.hasTraditionEvent,
        traditionEventNames: row.traditionEventNames,
        hasNoDrinkSite: row.hasNoDrinkSite,
        noDrinkSiteNames: row.noDrinkSiteNames,
        noAlcohol: row.noAlcohol,
        shopNames: row.shopNames,
        hasShopLegal: row.hasShopLegal,
        shopLegalNames: row.shopLegalNames,
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

  function toggle(key: EnvItemKey, field: keyof Pick<RowState, 'hasItem' | 'hasPolicy' | 'hasCommunityRule' | 'hasTraditionEvent' | 'hasNoDrinkSite' | 'noAlcohol' | 'hasShopLegal'>) {
    const updated = { ...rows[key], [field]: !rows[key][field] }
    setRows((prev) => ({ ...prev, [key]: updated }))
    doSave(key, updated)
  }

  async function uploadFile(key: EnvItemKey, file: File, slot: 'policy' | 'cr') {
    const uploadingField = slot === 'policy' ? 'policyUploading' : 'crUploading'
    patch(key, { [uploadingField]: true, error: '' })
    setGlobalSaving(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/community', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'อัปโหลดไม่สำเร็จ')

      const row = rows[key]
      const filePayload = slot === 'policy'
        ? { policyFileUrl: json.fileUrl as string, policyFileName: json.fileName as string }
        : { communityRuleFileUrl: json.fileUrl as string, communityRuleFileName: json.fileName as string }

      await upsertEnvItem(villageId, key, { hasItem: row.hasItem, ...filePayload })

      const urlField = slot === 'policy' ? 'policyFileUrl' : 'crFileUrl'
      const nameField = slot === 'policy' ? 'policyFileName' : 'crFileName'
      patch(key, { [uploadingField]: false, [urlField]: json.fileUrl, [nameField]: json.fileName })
      setGlobalSaved(true)
    } catch (e: unknown) {
      patch(key, {
        [uploadingField]: false,
        error: e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ',
      })
    } finally {
      setGlobalSaving(false)
    }
  }

  async function removeFile(key: EnvItemKey, slot: 'policy' | 'cr') {
    const row = rows[key]
    const filePayload = slot === 'policy'
      ? { policyFileUrl: null, policyFileName: null }
      : { communityRuleFileUrl: null, communityRuleFileName: null }

    const urlField = slot === 'policy' ? 'policyFileUrl' : 'crFileUrl'
    const nameField = slot === 'policy' ? 'policyFileName' : 'crFileName'
    patch(key, { [urlField]: null, [nameField]: null })

    setGlobalSaving(true)
    try {
      await upsertEnvItem(villageId, key, { hasItem: row.hasItem, ...filePayload })
      setGlobalSaved(true)
    } finally {
      setGlobalSaving(false)
    }
  }

  type NameList = 'shopNames' | 'shopLegalNames' | 'traditionEventNames' | 'noDrinkSiteNames'

  function addToList(key: EnvItemKey, list: NameList) {
    patch(key, { [list]: [...rows[key][list], ''] })
  }

  function updateInList(key: EnvItemKey, list: NameList, i: number, value: string) {
    const newList = [...rows[key][list]]
    newList[i] = value
    patch(key, { [list]: newList })
    setGlobalSaved(false)
  }

  function blurList(key: EnvItemKey) {
    doSave(key, rows[key])
  }

  function removeFromList(key: EnvItemKey, list: NameList, i: number) {
    const newList = rows[key][list].filter((_, idx) => idx !== i)
    const updated = { ...rows[key], [list]: newList }
    setRows((prev) => ({ ...prev, [key]: updated }))
    doSave(key, updated)
  }

  const inputCls = 'w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-5 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-yellow-400" />
            <p className="font-bold text-white text-sm">สิ่งแวดล้อม</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">องค์ประกอบแวดล้อม — บันทึกอัตโนมัติ</p>
        </div>
        {(() => {
          const missingFile = Object.values(rows).filter(r =>
            (r.hasPolicy && !r.policyFileUrl) || (r.hasCommunityRule && !r.crFileUrl)
          ).length
          return (
            <div className="flex items-center gap-1.5 mt-0.5">
              {globalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />}
              {!globalSaving && missingFile > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />ยังไม่มีไฟล์ {missingFile} รายการ
                </span>
              )}
              {!globalSaving && missingFile === 0 && globalSaved && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" />บันทึกแล้ว
                </span>
              )}
            </div>
          )
        })()}
      </div>

      <div className="divide-y divide-gray-100">
        {ENV_ITEMS.map(({ key, label }) => {
          const row = rows[key]
          const hasSubFields = (key === 'funeral' || key === 'tradition' || key === 'shop' || key === 'nodrinkzone') && row.hasItem

          return (
            <div key={key} className={`px-5 py-3 transition-colors ${row.hasItem ? 'bg-yellow-50/30' : ''}`}>
              {/* Main row */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggle(key, 'hasItem')} className="flex-shrink-0">
                  {row.hasItem
                    ? <CheckSquare className="w-5 h-5 text-yellow-500" />
                    : <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />}
                </button>
                <span className={`text-sm font-medium flex-1 ${row.hasItem ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                <div className="w-5 flex justify-center">
                  {row.saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />}
                  {row.saved  && <CheckCheck className="w-3.5 h-3.5 text-green-500" />}
                </div>
              </div>

              {/* Sub-fields */}
              {hasSubFields && (
                <div className="mt-3 ml-8 space-y-3">

                  {/* งานศพ sub-fields */}
                  {key === 'funeral' && (
                    <div className="space-y-2">
                      <PolicyRow
                        label="มีนโยบาย"
                        fileLabel="ไฟล์นโยบาย"
                        checked={row.hasPolicy}
                        onToggle={() => toggle(key, 'hasPolicy')}
                        fileUrl={row.policyFileUrl}
                        fileName={row.policyFileName}
                        uploading={row.policyUploading}
                        onUpload={(f) => uploadFile(key, f, 'policy')}
                        onRemove={() => removeFile(key, 'policy')}
                      />
                      <PolicyRow
                        label="มีกติกาชุมชน"
                        fileLabel="ไฟล์กติกาชุมชน"
                        checked={row.hasCommunityRule}
                        onToggle={() => toggle(key, 'hasCommunityRule')}
                        fileUrl={row.crFileUrl}
                        fileName={row.crFileName}
                        uploading={row.crUploading}
                        onUpload={(f) => uploadFile(key, f, 'cr')}
                        onRemove={() => removeFile(key, 'cr')}
                      />
                    </div>
                  )}

                  {/* งานประเพณี sub-fields */}
                  {key === 'tradition' && (
                    <div className="space-y-3">
                      <SubToggle
                        checked={row.hasTraditionEvent}
                        label="งานประเพณี"
                        onChange={() => toggle(key, 'hasTraditionEvent')}
                      />
                      {row.hasTraditionEvent && (
                        <div className="ml-6">
                          <NameList
                            label="ชื่องานประเพณี"
                            placeholder="กรอกชื่องานประเพณี..."
                            addLabel="เพิ่มชื่องาน"
                            values={row.traditionEventNames}
                            onAdd={() => addToList(key, 'traditionEventNames')}
                            onChange={(i, v) => updateInList(key, 'traditionEventNames', i, v)}
                            onBlur={() => blurList(key)}
                            onRemove={(i) => removeFromList(key, 'traditionEventNames', i)}
                            inputCls={inputCls}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* สถานที่ห้ามดื่มห้ามขาย sub-fields */}
                  {key === 'nodrinkzone' && (
                    <div className="space-y-3">
                      <SubToggle
                        checked={row.hasNoDrinkSite}
                        label="สถานที่ห้ามดื่มห้ามขาย"
                        onChange={() => toggle(key, 'hasNoDrinkSite')}
                      />
                      {row.hasNoDrinkSite && (
                        <div className="ml-6">
                          <NameList
                            label="ชื่อสถานที่ห้ามขาย-ห้ามดื่ม"
                            placeholder="กรอกชื่อสถานที่..."
                            addLabel="เพิ่มสถานที่"
                            values={row.noDrinkSiteNames}
                            onAdd={() => addToList(key, 'noDrinkSiteNames')}
                            onChange={(i, v) => updateInList(key, 'noDrinkSiteNames', i, v)}
                            onBlur={() => blurList(key)}
                            onRemove={(i) => removeFromList(key, 'noDrinkSiteNames', i)}
                            inputCls={inputCls}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ร้านค้า sub-fields */}
                  {key === 'shop' && (
                    <div className="space-y-3">
                      <SubToggle checked={row.noAlcohol} label="ไม่ขายเหล้าเลย" onChange={() => toggle(key, 'noAlcohol')} />
                      {row.noAlcohol && (
                        <div className="ml-6">
                          <NameList
                            label="ชื่อร้าน"
                            placeholder="กรอกชื่อร้าน..."
                            addLabel="เพิ่มชื่อร้าน"
                            values={row.shopNames}
                            onAdd={() => addToList(key, 'shopNames')}
                            onChange={(i, v) => updateInList(key, 'shopNames', i, v)}
                            onBlur={() => blurList(key)}
                            onRemove={(i) => removeFromList(key, 'shopNames', i)}
                            inputCls={inputCls}
                          />
                        </div>
                      )}

                      <SubToggle checked={row.hasShopLegal} label="ร้านขายเข้าร่วมตามกฎหมาย" onChange={() => toggle(key, 'hasShopLegal')} />
                      {row.hasShopLegal && (
                        <div className="ml-6">
                          <NameList
                            label="ชื่อร้าน"
                            placeholder="กรอกชื่อร้าน..."
                            addLabel="เพิ่มชื่อร้าน"
                            values={row.shopLegalNames}
                            onAdd={() => addToList(key, 'shopLegalNames')}
                            onChange={(i, v) => updateInList(key, 'shopLegalNames', i, v)}
                            onBlur={() => blurList(key)}
                            onRemove={(i) => removeFromList(key, 'shopLegalNames', i)}
                            inputCls={inputCls}
                          />
                        </div>
                      )}
                    </div>
                  )}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function PolicyRow({
  label, fileLabel, checked, onToggle,
  fileUrl, fileName, uploading,
  onUpload, onRemove,
}: {
  label: string
  fileLabel: string
  checked: boolean
  onToggle: () => void
  fileUrl: string | null
  fileName: string | null
  uploading: boolean
  onUpload: (f: File) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-sm flex-shrink-0">
        {checked
          ? <CheckSquare className="w-4 h-4 text-yellow-500" />
          : <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />}
        <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-500'}>{label}</span>
      </button>

      {fileUrl ? (
        <div className="inline-flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-2.5 py-1 text-xs">
          <FileCheck className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
          <a href={fileUrl} target="_blank" rel="noreferrer"
            className="text-yellow-700 hover:underline max-w-[200px] truncate">
            {fileName ?? 'ดูไฟล์'}
          </a>
          <button type="button" onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors ml-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <label className={`inline-flex items-center gap-1.5 text-xs cursor-pointer transition-colors
            ${uploading ? 'text-gray-400 pointer-events-none' : 'text-gray-400 hover:text-yellow-600'}`}>
            {uploading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Upload className="w-3.5 h-3.5" />}
            <span>{uploading ? 'กำลังอัปโหลด...' : fileLabel}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onUpload(f)
                e.target.value = ''
              }}
            />
          </label>
          {checked && !uploading && (
            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
              <AlertCircle className="w-3 h-3" />กรุณาแนบไฟล์
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function SubToggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-1.5 text-sm">
      {checked
        ? <CheckSquare className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        : <Square className="w-4 h-4 text-gray-300 hover:text-gray-400 flex-shrink-0" />}
      <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-500'}>{label}</span>
    </button>
  )
}

function NameList({ label, placeholder, addLabel, values, onAdd, onChange, onBlur, onRemove, inputCls }: {
  label: string
  placeholder: string
  addLabel: string
  values: string[]
  onAdd: () => void
  onChange: (i: number, v: string) => void
  onBlur: () => void
  onRemove: (i: number) => void
  inputCls: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-0.5 text-xs text-yellow-600 hover:text-yellow-700 font-medium">
          <Plus className="w-3 h-3" />เพิ่ม
        </button>
      </div>
      {values.length === 0 ? (
        <button type="button" onClick={onAdd}
          className="w-full px-2.5 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:border-yellow-400 hover:text-yellow-600 transition-colors text-left">
          + {addLabel}
        </button>
      ) : (
        <div className="space-y-1.5">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input value={v} onChange={(e) => onChange(i, e.target.value)} onBlur={onBlur}
                placeholder={placeholder} className={inputCls} />
              <button type="button" onClick={() => onRemove(i)}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
