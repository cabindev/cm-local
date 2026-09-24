'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/app/lib/compressImage'
import { useTambonSearch } from '@/app/hooks/useTambonSearch'
import { PROVINCE_ZONE } from '@/app/lib/province-zone'
import { Pencil, X, Loader2, Check, Search, Lock, MapPin } from 'lucide-react'

interface Props {
  userId: number
  firstName: string
  lastName: string
  image: string | null
  district: string | null   // ตำบล
  amphoe: string | null
  province: string | null
  zone: string | null
}

export default function ProfileEditForm({ firstName, lastName, image, district, amphoe, province, zone }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [fn, setFn] = useState(firstName)
  const [ln, setLn] = useState(lastName)
  const [preview, setPreview] = useState<string | null>(image)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // พื้นที่รับผิดชอบ — ใช้ตัวค้นหาตำบลชุดเดียวกับฟอร์มหมู่บ้าน ภาคมาจากจังหวัดอัตโนมัติ
  const area = useTambonSearch(
    province ? { TAMBON_T: district ?? '', AMPHOE_T: amphoe ?? '', CHANGWAT_T: province } : null
  )
  const areaZone = area.selected ? (PROVINCE_ZONE[area.selected.CHANGWAT_T] ?? '') : ''
  const areaChanged =
    (area.selected?.TAMBON_T ?? '') !== (district ?? '') ||
    (area.selected?.AMPHOE_T ?? '') !== (amphoe ?? '') ||
    (area.selected?.CHANGWAT_T ?? '') !== (province ?? '')

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('รองรับเฉพาะ JPG, PNG, WEBP'); return
    }
    try {
      const compressed = await compressImage(f, 800, 300_000)
      setFile(compressed)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(compressed)
      setError(null)
    } catch { setError('ประมวลผลรูปไม่สำเร็จ') }
  }

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false)
    try {
      const data = new FormData()
      data.append('firstName', fn)
      data.append('lastName', ln)
      if (file) data.append('image', file)
      data.append('district', area.selected?.TAMBON_T ?? '')
      data.append('amphoe', area.selected?.AMPHOE_T ?? '')
      data.append('province', area.selected?.CHANGWAT_T ?? '')
      const res = await fetch('/api/profile/update', { method: 'POST', body: data })
      if (!res.ok) throw new Error()
      setSaved(true)
      router.refresh()
      setTimeout(() => { setSaved(false); setEditing(false) }, 1500)
    } catch { setError('บันทึกไม่สำเร็จ โปรดลองอีกครั้ง') }
    finally { setSaving(false) }
  }

  const handleCancel = () => {
    setFn(firstName); setLn(lastName)
    setPreview(image); setFile(null)
    area.setSelected(province ? { TAMBON_T: district ?? '', AMPHOE_T: amphoe ?? '', CHANGWAT_T: province } : null)
    area.setSearch('')
    setError(null); setEditing(false)
  }

  const changed = fn !== firstName || ln !== lastName || file !== null || areaChanged

  // ── View mode ────────────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <div className="flex items-center gap-3 border-b-2 border-gray-900 pb-6">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {image
            ? <img src={image} alt="avatar" className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-gray-900">{firstName.charAt(0)}{lastName.charAt(0)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{firstName} {lastName}</p>
          <p className="text-[11px] text-gray-500 font-light truncate">
            {province
              ? <><MapPin className="inline w-3 h-3 -mt-0.5 mr-0.5 text-gray-400" />
                  {[district && `ต.${district}`, amphoe && `อ.${amphoe}`, `จ.${province}`].filter(Boolean).join(' ')}
                  {zone && <span className="ml-1.5 text-gray-400">ภาค{zone}</span>}
                </>
              : 'ยังไม่ระบุพื้นที่รับผิดชอบ'}
          </p>
        </div>
        <button onClick={() => setEditing(true)}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors flex-shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────────
  return (
    <div className="border-b-2 border-gray-900 pb-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">แก้ไขโปรไฟล์</p>
        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-900 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="relative w-16 h-16 rounded-full overflow-hidden bg-yellow-400 flex-shrink-0 group">
          {preview
            ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            : <span className="text-lg font-black text-gray-900">{fn.charAt(0)}{ln.charAt(0)}</span>
          }
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="w-4 h-4 text-white" />
          </div>
        </button>
        <div className="text-xs text-gray-400 leading-relaxed">
          <p>กดที่รูปเพื่อเปลี่ยน</p>
          <p className="text-[10px]">JPG / PNG / WEBP · บีบอัดอัตโนมัติ</p>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handleImage} />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">ชื่อ</label>
          <input value={fn} onChange={e => setFn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">นามสกุล</label>
          <input value={ln} onChange={e => setLn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
        </div>
      </div>

      {/* พื้นที่รับผิดชอบ */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          พื้นที่รับผิดชอบ
        </label>
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={
                area.selected
                  ? [area.selected.TAMBON_T && `ต.${area.selected.TAMBON_T}`, `อ.${area.selected.AMPHOE_T}`, `จ.${area.selected.CHANGWAT_T}`].filter(Boolean).join(' ')
                  : area.search
              }
              onChange={(e) => { area.setSearch(e.target.value); area.setSelected(null); area.setShowDropdown(true) }}
              onFocus={() => area.setShowDropdown(true)}
              onBlur={() => setTimeout(() => area.setShowDropdown(false), 200)}
              placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
            />
            {area.selected && (
              <button type="button" aria-label="ล้างพื้นที่"
                onClick={() => { area.setSelected(null); area.setSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {area.showDropdown && area.filtered.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {area.filtered.map((t, i) => (
                <li key={i} onMouseDown={() => area.selectTambon(t)}
                  className="px-3 py-2 text-sm text-gray-900 hover:bg-yellow-50 cursor-pointer">
                  ต.{t.TAMBON_T} อ.{t.AMPHOE_T} จ.{t.CHANGWAT_T}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-[10px] text-gray-400 flex-shrink-0">ภาค</span>
          {areaZone
            ? <span className="text-xs font-semibold text-gray-900">{areaZone}</span>
            : <span className="text-xs text-gray-400 italic">กำหนดอัตโนมัติเมื่อเลือกตำบล</span>}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || !changed}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : null}
          {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว' : 'บันทึก'}
        </button>
        <button onClick={handleCancel}
          className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors">
          ยกเลิก
        </button>
      </div>

    </div>
  )
}
