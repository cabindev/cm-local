'use client'

import { useState } from 'react'
import { upsertEnvItem } from '@/app/actions/village-data'
import {
  Leaf, CheckSquare, Square, Plus, X,
  Loader2, CheckCheck, Upload, FileCheck,
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
  result1: string | null
  result2: string | null
  result3: string | null
  hasPolicy: boolean | null
  policyFileUrl: string | null
  policyFileName: string | null
  hasCommunityRule: boolean | null
  communityRuleFileUrl: string | null
  communityRuleFileName: string | null
  noAlcohol: boolean | null
  shopNames: string | null
  hasShopLegal: boolean | null
  shopLegalNames: string | null
}

type RowState = {
  hasItem: boolean
  result1: string
  result2: string
  result3: string
  hasPolicy: boolean
  policyFileUrl: string | null
  policyFileName: string | null
  policyUploading: boolean
  hasCommunityRule: boolean
  crFileUrl: string | null
  crFileName: string | null
  crUploading: boolean
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
    result1: rec?.result1 ?? '',
    result2: rec?.result2 ?? '',
    result3: rec?.result3 ?? '',
    hasPolicy: rec?.hasPolicy ?? false,
    policyFileUrl: rec?.policyFileUrl ?? null,
    policyFileName: rec?.policyFileName ?? null,
    policyUploading: false,
    hasCommunityRule: rec?.hasCommunityRule ?? false,
    crFileUrl: rec?.communityRuleFileUrl ?? null,
    crFileName: rec?.communityRuleFileName ?? null,
    crUploading: false,
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
        result1: row.result1 || undefined,
        result2: row.result2 || undefined,
        result3: row.result3 || undefined,
        hasPolicy: row.hasPolicy,
        hasCommunityRule: row.hasCommunityRule,
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

  function toggle(key: EnvItemKey, field: keyof Pick<RowState, 'hasItem' | 'hasPolicy' | 'hasCommunityRule' | 'noAlcohol' | 'hasShopLegal'>) {
    const updated = { ...rows[key], [field]: !rows[key][field] }
    setRows((prev) => ({ ...prev, [key]: updated }))
    doSave(key, updated)
  }

  function setText(key: EnvItemKey, field: 'result1' | 'result2' | 'result3', value: string) {
    patch(key, { [field]: value })
    setGlobalSaved(false)
  }

  function blurText(key: EnvItemKey) {
    doSave(key, rows[key])
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

      // Save file fields only — action preserves all other existing fields
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

  // Shop list helpers
  function addShop(key: EnvItemKey, list: 'shopNames' | 'shopLegalNames') {
    patch(key, { [list]: [...rows[key][list], ''] })
  }

  function updateShop(key: EnvItemKey, list: 'shopNames' | 'shopLegalNames', i: number, value: string) {
    const newList = [...rows[key][list]]
    newList[i] = value
    patch(key, { [list]: newList })
    setGlobalSaved(false)
  }

  function blurShop(key: EnvItemKey) {
    doSave(key, rows[key])
  }

  function removeShop(key: EnvItemKey, list: 'shopNames' | 'shopLegalNames', i: number) {
    const newList = rows[key][list].filter((_, idx) => idx !== i)
    const updated = { ...rows[key], [list]: newList }
    setRows((prev) => ({ ...prev, [key]: updated }))
    doSave(key, updated)
  }

  const inputCls = 'w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-yellow-400" />
            <p className="font-bold text-white text-sm">สิ่งแวดล้อม</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">องค์ประกอบแวดล้อม — บันทึกอัตโนมัติ</p>
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

      <div className="grid grid-cols-[180px_44px_1fr_1fr_1fr_28px] gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        <span>สภาพแวดล้อม</span>
        <span className="text-center">มี</span>
        <span>ผลปีที่ 1</span>
        <span>ผลปีที่ 2</span>
        <span>ผลปีที่ 3</span>
        <span />
      </div>

      <div className="divide-y divide-gray-100">
        {ENV_ITEMS.map(({ key, label }) => {
          const row = rows[key]
          const hasSubFields = (key === 'funeral' || key === 'shop') && row.hasItem

          return (
            <div key={key} className={`px-5 py-3 transition-colors ${row.hasItem ? 'bg-yellow-50/30' : ''}`}>
              <div className="grid grid-cols-[180px_44px_1fr_1fr_1fr_28px] gap-2 items-center">
                <span className="text-sm font-medium text-gray-800">{label}</span>

                <button type="button" onClick={() => toggle(key, 'hasItem')} className="flex justify-center">
                  {row.hasItem
                    ? <CheckSquare className="w-5 h-5 text-yellow-500" />
                    : <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />}
                </button>

                <input value={row.result1} onChange={(e) => setText(key, 'result1', e.target.value)} onBlur={() => blurText(key)} placeholder="บันทึกผล..." className={inputCls} />
                <input value={row.result2} onChange={(e) => setText(key, 'result2', e.target.value)} onBlur={() => blurText(key)} placeholder="บันทึกผล..." className={inputCls} />
                <input value={row.result3} onChange={(e) => setText(key, 'result3', e.target.value)} onBlur={() => blurText(key)} placeholder="บันทึกผล..." className={inputCls} />

                <div className="flex justify-center">
                  {row.saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />}
                  {row.saved  && <CheckCheck className="w-3.5 h-3.5 text-green-500" />}
                </div>
              </div>

              {hasSubFields && (
                <div className="mt-3 ml-[196px] space-y-3">

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

                  {/* ร้านค้า sub-fields */}
                  {key === 'shop' && (
                    <div className="space-y-3">
                      {/* ไม่ขายเหล้าเลย + ชื่อร้าน */}
                      <SubToggle checked={row.noAlcohol} label="ไม่ขายเหล้าเลย" onChange={() => toggle(key, 'noAlcohol')} />
                      {row.noAlcohol && (
                        <div className="ml-6">
                          <ShopList
                            label="ชื่อร้าน"
                            placeholder="กรอกชื่อร้าน..."
                            values={row.shopNames}
                            onAdd={() => addShop(key, 'shopNames')}
                            onChange={(i, v) => updateShop(key, 'shopNames', i, v)}
                            onBlur={() => blurShop(key)}
                            onRemove={(i) => removeShop(key, 'shopNames', i)}
                            inputCls={inputCls}
                          />
                        </div>
                      )}

                      {/* ร้านขายเข้าร่วมตามกฎหมาย + ชื่อร้าน */}
                      <SubToggle checked={row.hasShopLegal} label="ร้านขายเข้าร่วมตามกฎหมาย" onChange={() => toggle(key, 'hasShopLegal')} />
                      {row.hasShopLegal && (
                        <div className="ml-6">
                          <ShopList
                            label="ชื่อร้าน"
                            placeholder="กรอกชื่อร้าน..."
                            values={row.shopLegalNames}
                            onAdd={() => addShop(key, 'shopLegalNames')}
                            onChange={(i, v) => updateShop(key, 'shopLegalNames', i, v)}
                            onBlur={() => blurShop(key)}
                            onRemove={(i) => removeShop(key, 'shopLegalNames', i)}
                            inputCls={inputCls}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {row.error && (
                <p className="mt-1 ml-[196px] text-xs text-red-500">{row.error}</p>
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
      {/* Toggle */}
      <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-sm flex-shrink-0">
        {checked
          ? <CheckSquare className="w-4 h-4 text-yellow-500" />
          : <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />}
        <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-500'}>{label}</span>
      </button>

      {/* File area — always visible so user can attach even before toggling */}
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

function ShopList({ label, placeholder, values, onAdd, onChange, onBlur, onRemove, inputCls }: {
  label: string
  placeholder: string
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
          + เพิ่มชื่อร้าน
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
