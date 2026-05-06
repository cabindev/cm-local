'use client'

import { useState, useEffect, useMemo, useRef, FormEvent } from 'react'
import Link from 'next/link'
import { data as regions } from '@/app/data/regions'
import { Search, X, MapPin } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  image: File | null
  zone: string
  province: string
  amphoe: string
  district: string
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', password: '',
    image: null, zone: '', province: '', amphoe: '', district: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Location search state
  const [searchTerm, setSearchTerm]       = useState('')
  const [debounced, setDebounced]         = useState('')
  const [showDropdown, setShowDropdown]   = useState(false)
  const [locationSelected, setLocationSelected] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 250)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const results = useMemo(() => {
    if (!debounced || debounced.length < 2 || locationSelected) return []
    const term = debounced.toLowerCase()
    return regions
      .filter(r =>
        r.district.toLowerCase().includes(term) ||
        r.amphoe.toLowerCase().includes(term) ||
        r.province.toLowerCase().includes(term)
      )
      .slice(0, 10)
  }, [debounced, locationSelected])

  const handleSelect = (r: typeof regions[0]) => {
    setFormData(prev => ({ ...prev, district: r.district, amphoe: r.amphoe, province: r.province, zone: r.zone }))
    setSearchTerm(`${r.district} • ${r.amphoe} • ${r.province}`)
    setLocationSelected(true)
    setShowDropdown(false)
  }

  const clearLocation = () => {
    setFormData(prev => ({ ...prev, district: '', amphoe: '', province: '', zone: '' }))
    setSearchTerm('')
    setLocationSelected(false)
    setShowDropdown(false)
  }

  // Image
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          const MAX = 1200
          if (width > height && width > MAX) { height = Math.round(height * MAX / width); width = MAX }
          else if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
          canvas.width = width; canvas.height = height
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
          let quality = 0.9
          const fileType = file.type || 'image/jpeg'
          const tryQ = () => {
            const dataUrl = canvas.toDataURL(fileType, quality)
            const bytes = atob(dataUrl.split(',')[1])
            const ab = new Uint8Array(bytes.length)
            for (let i = 0; i < bytes.length; i++) ab[i] = bytes.charCodeAt(i)
            const compressed = new File([ab], file.name, { type: fileType, lastModified: Date.now() })
            if (compressed.size > 500000 && quality > 0.1) { quality -= 0.1; setTimeout(tryQ, 0) }
            else resolve(compressed)
          }
          tryQ()
        }
        img.onerror = reject
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG, WEBP)'); return
    }
    try {
      const compressed = await compressImage(file)
      setFormData(prev => ({ ...prev, image: compressed }))
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(compressed)
      setError(null)
    } catch { setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ') }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(null)
    try {
      const data = new FormData()
      data.append('firstName', formData.firstName)
      data.append('lastName', formData.lastName)
      data.append('email', formData.email)
      data.append('password', formData.password)
      if (formData.image)    data.append('image', formData.image)
      if (formData.zone)     data.append('zone', formData.zone)
      if (formData.province) data.append('province', formData.province)
      if (formData.amphoe)   data.append('amphoe', formData.amphoe)
      if (formData.district) data.append('district', formData.district)

      const res = await fetch('/api/auth/signup', { method: 'POST', body: data })
      if (res.ok) {
        window.location.href = '/auth/signin'
      } else {
        const result = await res.json()
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch { setError('เกิดข้อผิดพลาดในการเชื่อมต่อ') }
    finally { setIsLoading(false) }
  }

  const inputClass = 'block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 bg-white transition-colors'
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-yellow-400 px-8 py-6">
          <h2 className="text-2xl font-black text-gray-900">สมัครสมาชิก</h2>
          <p className="text-sm text-yellow-800 mt-0.5">Conmunity — เชื่อมต่อชุมชน</p>
        </div>

        <form className="px-8 py-6 space-y-4" onSubmit={handleSubmit}>

          {/* ชื่อ - นามสกุล */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>ชื่อ</label>
              <input type="text" required className={inputClass} placeholder="ชื่อ"
                value={formData.firstName}
                onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>นามสกุล</label>
              <input type="text" required className={inputClass} placeholder="นามสกุล"
                value={formData.lastName}
                onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>

          {/* อีเมล */}
          <div>
            <label className={labelClass}>อีเมล</label>
            <input type="email" required className={inputClass} placeholder="your@email.com"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className={labelClass}>รหัสผ่าน</label>
            <input type="password" required className={inputClass} placeholder="อย่างน้อย 5 ตัวอักษร"
              value={formData.password}
              onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
          </div>

          {/* ค้นหาตำบล */}
          <div>
            <label className={labelClass}>พื้นที่ดูแล <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
            <div className="relative" ref={searchRef}>
              <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
                locationSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white focus-within:border-yellow-400'
              }`}>
                {locationSelected
                  ? <MapPin className="w-4 h-4 text-yellow-500 ml-3 flex-shrink-0" />
                  : <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                }
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
                  value={searchTerm}
                  readOnly={locationSelected}
                  onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true) }}
                  onFocus={() => { if (!locationSelected) setShowDropdown(true) }}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                />
                {(searchTerm || locationSelected) && (
                  <button type="button" onClick={clearLocation} className="p-2 text-gray-300 hover:text-gray-500 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown results */}
              {showDropdown && results.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {results.map((r, i) => (
                    <div key={`${r.district_code}-${i}`}
                      onMouseDown={() => handleSelect(r)}
                      className="px-4 py-2.5 hover:bg-yellow-50 cursor-pointer border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm">ต.{r.district}</span>
                        <span className="text-gray-400 text-xs">อ.{r.amphoe} · {r.province}</span>
                      </div>
                      <span className="ml-5.5 text-[10px] text-yellow-600 font-medium">{r.zone}</span>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && debounced.length >= 2 && results.length === 0 && !locationSelected && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
                  ไม่พบผลลัพธ์
                </div>
              )}
            </div>

            {/* แสดงข้อมูลที่เลือก */}
            {locationSelected && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { label: 'ตำบล', value: formData.district },
                  { label: 'อำเภอ', value: formData.amphoe },
                  { label: 'จังหวัด', value: formData.province },
                  { label: 'ภาค', value: formData.zone },
                ].map(row => (
                  <div key={row.label} className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-1.5">
                    <p className="text-[10px] text-yellow-700 font-medium">{row.label}</p>
                    <p className="text-xs font-semibold text-gray-900">{row.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* รูปโปรไฟล์ */}
          <div>
            <label className={labelClass}>รูปโปรไฟล์ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-yellow-50 flex items-center justify-center flex-shrink-0 border-2 border-yellow-200">
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  : <span className="text-yellow-300 text-xl">👤</span>
                }
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-300 cursor-pointer" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${
              isLoading ? 'bg-yellow-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
            }`}>
            {isLoading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
          </button>

          <p className="text-center text-sm text-gray-500">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/auth/signin" className="font-semibold text-gray-800 hover:text-yellow-600 underline underline-offset-2">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
