'use client'

import { useState } from 'react'
import { upsertCommunityBackground } from '@/app/actions/village-data'
import { FileText, Upload, X, CheckCircle2, Circle, Loader2, FileCheck, CheckCheck, AlertCircle } from 'lucide-react'

const BG_ITEMS = [
  { key: 'communityCalendar',    label: 'ข้อมูลปฏิทินชุมชน' },
  { key: 'riskLocation',         label: 'ข้อมูลความเจ็บป่วยต่อสถานที่เสี่ยง' },
  { key: 'participationPolicy',  label: 'ข้อมูลนโยบายการมีส่วนร่วม' },
  { key: 'capacityPolicy',       label: 'ข้อมูลนโยบายพัฒนาศักยภาพการทำงาน' },
  { key: 'communityHistory',     label: 'ข้อมูลประวัติชุมชน' },
]

type BgRecord = {
  itemType: string
  hasItem: boolean
  fileUrl: string | null
  fileName: string | null
}

type RowState = {
  hasItem: boolean
  fileUrl: string | null
  fileName: string | null
  uploading: boolean
  saving: boolean
  error: string
}

export default function CommunityBackgroundEditor({
  villageId,
  initial,
}: {
  villageId: number
  initial: BgRecord[]
}) {
  const initMap = Object.fromEntries(initial.map((b) => [b.itemType, b]))

  const [globalSaving, setGlobalSaving] = useState(false)
  const [globalSaved,  setGlobalSaved]  = useState(initial.length > 0)

  const [rows, setRows] = useState<Record<string, RowState>>(
    Object.fromEntries(
      BG_ITEMS.map(({ key }) => [
        key,
        {
          hasItem: initMap[key]?.hasItem ?? false,
          fileUrl: initMap[key]?.fileUrl ?? null,
          fileName: initMap[key]?.fileName ?? null,
          uploading: false,
          saving: false,
          error: '',
        },
      ])
    )
  )

  function set(key: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  async function toggleHasItem(key: string, checked: boolean) {
    set(key, { hasItem: checked, saving: true, error: '' })
    setGlobalSaving(true)
    try {
      await upsertCommunityBackground(villageId, key, checked)
      setGlobalSaved(true)
    } catch {
      set(key, { hasItem: !checked, error: 'บันทึกไม่สำเร็จ' })
    } finally {
      set(key, { saving: false })
      setGlobalSaving(false)
    }
  }

  async function handleFileUpload(key: string, file: File) {
    set(key, { uploading: true, error: '' })
    setGlobalSaving(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/community', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'อัปโหลดไม่สำเร็จ')

      set(key, { fileUrl: json.fileUrl, fileName: json.fileName, saving: true })
      await upsertCommunityBackground(villageId, key, rows[key].hasItem, json.fileUrl, json.fileName)
      set(key, { saving: false })
      setGlobalSaved(true)
    } catch (e: unknown) {
      set(key, { error: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' })
    } finally {
      set(key, { uploading: false })
      setGlobalSaving(false)
    }
  }

  async function removeFile(key: string) {
    set(key, { saving: true, error: '' })
    setGlobalSaving(true)
    try {
      await upsertCommunityBackground(villageId, key, rows[key].hasItem, null, null)
      set(key, { fileUrl: null, fileName: null })
      setGlobalSaved(true)
    } catch {
      set(key, { error: 'ลบไฟล์ไม่สำเร็จ' })
    } finally {
      set(key, { saving: false })
      setGlobalSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-yellow-400" />
            <p className="font-bold text-white text-sm">ข้อมูลพื้นฐาน</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">ข้อมูลประวัติชุมชน — เลือกหัวข้อที่มีและแนบไฟล์</p>
        </div>
        {(() => {
          const incomplete = Object.values(rows).filter(r => r.hasItem && !r.fileUrl).length
          return (
            <div className="flex items-center gap-1.5 mt-0.5">
              {globalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />}
              {!globalSaving && incomplete > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />ยังไม่มีไฟล์ {incomplete} รายการ
                </span>
              )}
              {!globalSaving && incomplete === 0 && globalSaved && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" />บันทึกแล้ว
                </span>
              )}
            </div>
          )
        })()}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {BG_ITEMS.map(({ key, label }) => {
          const row = rows[key]
          const busy = row.uploading || row.saving

          return (
            <div
              key={key}
              className={`px-5 py-4 transition-colors ${row.hasItem ? 'bg-yellow-50/40' : 'bg-white'}`}
            >
              <div className="flex items-start gap-4">
                {/* Toggle */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleHasItem(key, !row.hasItem)}
                  className={`flex-shrink-0 mt-0.5 transition-colors ${busy ? 'opacity-40' : ''}`}
                >
                  {row.saving ? (
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                  ) : row.hasItem ? (
                    <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                  )}
                </button>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${row.hasItem ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </p>

                  {/* File area — แสดงเฉพาะเมื่อติ๊กเลือก */}
                  {row.hasItem && <div className="mt-2">
                    {row.fileUrl ? (
                      /* File attached */
                      <div className="inline-flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-3 py-1.5 text-xs">
                        <FileCheck className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-yellow-700 hover:underline max-w-[180px] truncate"
                        >
                          {row.fileName ?? 'ดูไฟล์'}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeFile(key)}
                          disabled={busy}
                          className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Upload button */
                      <label className={`inline-flex items-center gap-1.5 text-xs cursor-pointer transition-colors
                        ${row.uploading
                          ? 'text-gray-400 pointer-events-none'
                          : 'text-gray-400 hover:text-yellow-600'
                        }`}
                      >
                        {row.uploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{row.uploading ? 'กำลังอัปโหลด...' : 'แนบไฟล์ (PDF, Word)'}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          disabled={busy}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload(key, f)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    )}

                    {!row.fileUrl && !row.uploading && (
                      <p className="flex items-center gap-1 text-xs text-orange-500 mt-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        กรุณาแนบไฟล์เพื่อให้ข้อมูลสมบูรณ์
                      </p>
                    )}
                    {row.error && (
                      <p className="text-xs text-red-500 mt-1">{row.error}</p>
                    )}
                  </div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
