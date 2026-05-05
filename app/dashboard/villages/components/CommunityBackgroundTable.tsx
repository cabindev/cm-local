'use client'

import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { upsertCommunityBackground } from '@/app/actions/health-data'

type BgRow = { id: number; itemType: string; hasItem: boolean; fileUrl: string | null; fileName: string | null }

const ITEMS = [
  { type: 'calendar',      label: 'ข้อมูลปฏิทินชุมชน' },
  { type: 'riskArea',      label: 'ข้อมูลวิเคราะห์พื้นที่เสี่ยง' },
  { type: 'participation', label: 'ข้อมูลวิเคราะห์การมีส่วนร่วม' },
  { type: 'teamCapacity',  label: 'ข้อมูลวิเคราะห์ศักยภาพคณะทำงาน' },
  { type: 'history',       label: 'ข้อมูลประวัติชุมชน' },
]

export type CommunityBackgroundTableHandle = { save: () => Promise<void> }

const CommunityBackgroundTable = forwardRef<CommunityBackgroundTableHandle, { villageId: number; items: BgRow[] }>(
  function CommunityBackgroundTable({ villageId, items }, ref) {
    const find = (type: string) => items.find((i) => i.itemType === type)
    const [rows, setRows] = useState(() =>
      ITEMS.map((item) => {
        const saved = find(item.type)
        return { type: item.type, hasItem: saved?.hasItem ?? false, fileUrl: saved?.fileUrl ?? null, fileName: saved?.fileName ?? null }
      })
    )
    const [uploading, setUploading] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const update = (type: string, key: string, value: boolean | string | null) =>
      setRows((prev) => prev.map((r) => r.type === type ? { ...r, [key]: value } : r))

    const handleFileUpload = async (type: string, file: File) => {
      setUploading(type)
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await fetch('/api/upload/community', { method: 'POST', body: form })
        const data = await res.json()
        if (res.ok) { update(type, 'fileUrl', data.fileUrl); update(type, 'fileName', data.fileName) }
        else {
          setUploadError(data.error ?? 'อัปโหลดไม่สำเร็จ')
          setTimeout(() => setUploadError(null), 4000)
        }
      } finally { setUploading(null) }
    }

    const removeFile = (type: string) => {
      update(type, 'fileUrl', null); update(type, 'fileName', null)
      const ref = fileRefs.current[type]; if (ref) ref.value = ''
    }

    useImperativeHandle(ref, () => ({
      async save() {
        await Promise.all(rows.map((r) =>
          upsertCommunityBackground(villageId, r.type, {
            hasItem: r.hasItem, fileUrl: r.fileUrl ?? undefined, fileName: r.fileName ?? undefined,
          })
        ))
      }
    }), [villageId, rows])

    const FileCell = ({ type, row }: { type: string; row: typeof rows[0] }) => (
      row.fileUrl ? (
        <div className="flex items-center gap-2">
          <a href={row.fileUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 hover:bg-yellow-100 transition-colors max-w-xs">
            <span>📄</span>
            <span className="text-xs truncate">{row.fileName}</span>
          </a>
          <button type="button" onClick={() => removeFile(type)}
            className="text-gray-300 hover:text-gray-600 transition-colors text-xs flex-shrink-0">✕</button>
        </div>
      ) : (
        <label className="cursor-pointer text-gray-400 hover:text-gray-700 transition-colors text-xs">
          {uploading === type ? <span className="text-yellow-600">กำลังอัปโหลด...</span> : 'อัปโหลดไฟล์'}
          <input type="file" accept=".pdf,.doc,.docx" className="hidden"
            ref={(el) => { fileRefs.current[type] = el }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(type, f) }} />
        </label>
      )
    )

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">ข้อมูลพื้นฐาน</p>
          <p className="text-sm font-medium text-white mt-0.5">ข้อมูลประวัติชุมชน</p>
        </div>

        {uploadError && (
          <div className="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {uploadError}
          </div>
        )}

        {/* Mobile: cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {ITEMS.map(({ type, label }) => {
            const row = rows.find((r) => r.type === type)!
            return (
              <div key={type} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-400">มี</span>
                    <input type="checkbox" checked={row.hasItem}
                      onChange={(e) => update(type, 'hasItem', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400" />
                  </label>
                </div>
                <FileCell type={type} row={row} />
              </div>
            )
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-2.5 font-medium text-gray-400">รายการ</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-400 w-16">มี</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-400">ไฟล์แนบ</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((item, i) => {
                const row = rows.find((r) => r.type === item.type)!
                return (
                  <tr key={item.type} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === ITEMS.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-5 py-3 text-gray-700">{item.label}</td>
                    <td className="px-4 py-3 text-center">
                      <label className="flex items-center justify-center cursor-pointer p-2 -m-2">
                        <input type="checkbox" checked={row.hasItem}
                          onChange={(e) => update(item.type, 'hasItem', e.target.checked)}
                          className="w-4 h-4 accent-yellow-400" />
                      </label>
                    </td>
                    <td className="px-5 py-3">
                      <FileCell type={item.type} row={row} />
                    </td>
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

export default CommunityBackgroundTable
