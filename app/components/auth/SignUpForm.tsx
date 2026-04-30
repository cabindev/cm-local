'use client'

import { useState, FormEvent, useMemo } from 'react'
import Link from 'next/link'
import { data as regionData } from '@/app/data/regions'

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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    image: null,
    zone: '',
    province: '',
    amphoe: '',
    district: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const zones = useMemo(() => [...new Set(regionData.map((r) => r.zone))].sort(), [])

  const provinces = useMemo(() => {
    if (!formData.zone) return []
    return [...new Set(regionData.filter((r) => r.zone === formData.zone).map((r) => r.province))].sort()
  }, [formData.zone])

  const amphoes = useMemo(() => {
    if (!formData.province) return []
    return [...new Set(regionData.filter((r) => r.province === formData.province).map((r) => r.amphoe))].sort()
  }, [formData.province])

  const districts = useMemo(() => {
    if (!formData.amphoe) return []
    return [...new Set(regionData.filter((r) => r.amphoe === formData.amphoe).map((r) => r.district))].sort()
  }, [formData.amphoe])

  const handleZoneChange = (zone: string) => {
    setFormData((prev) => ({ ...prev, zone, province: '', amphoe: '', district: '' }))
  }

  const handleProvinceChange = (province: string) => {
    setFormData((prev) => ({ ...prev, province, amphoe: '', district: '' }))
  }

  const handleAmphoeChange = (amphoe: string) => {
    setFormData((prev) => ({ ...prev, amphoe, district: '' }))
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const MAX_SIZE = 1200
          if (width > height && width > MAX_SIZE) {
            height = Math.round(height * MAX_SIZE / width)
            width = MAX_SIZE
          } else if (height > MAX_SIZE) {
            width = Math.round(width * MAX_SIZE / height)
            height = MAX_SIZE
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          let quality = 0.9
          const fileType = file.type || 'image/jpeg'
          const tryQuality = () => {
            const dataUrl = canvas.toDataURL(fileType, quality)
            const byteString = atob(dataUrl.split(',')[1])
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
            const blob = new Blob([ab], { type: fileType })
            const compressed = new File([blob], file.name, { type: fileType, lastModified: Date.now() })
            if (compressed.size > 500000 && quality > 0.1) {
              quality -= 0.1
              setTimeout(tryQuality, 0)
            } else {
              resolve(compressed)
            }
          }
          tryQuality()
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
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG, WEBP)')
      return
    }
    try {
      const compressed = await compressImage(file)
      setFormData((prev) => ({ ...prev, image: compressed }))
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(compressed)
      setError(null)
    } catch {
      setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = new FormData()
      data.append('firstName', formData.firstName)
      data.append('lastName', formData.lastName)
      data.append('email', formData.email)
      data.append('password', formData.password)
      if (formData.image) data.append('image', formData.image)
      if (formData.zone) data.append('zone', formData.zone)
      if (formData.province) data.append('province', formData.province)
      if (formData.amphoe) data.append('amphoe', formData.amphoe)
      if (formData.district) data.append('district', formData.district)

      const response = await fetch('/api/auth/signup', { method: 'POST', body: data })

      if (response.ok) {
        window.location.href = '/auth/signin'
      } else {
        const result = await response.json()
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none text-sm'
  const labelClass = 'block text-sm font-medium text-gray-700'
  const selectClass = `${inputClass} bg-white`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8 px-4">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">สมัครสมาชิก</h2>
          <p className="mt-1 text-sm text-gray-500">Conmunity — เชื่อมต่อชุมชน</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* ชื่อ - นามสกุล */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ชื่อ</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>นามสกุล</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          {/* อีเมล */}
          <div>
            <label className={labelClass}>อีเมล</label>
            <input
              type="email"
              required
              className={inputClass}
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className={labelClass}>รหัสผ่าน</label>
            <input
              type="password"
              required
              className={inputClass}
              placeholder="อย่างน้อย 5 ตัวอักษร"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {/* ภูมิภาค */}
          <div>
            <label className={labelClass}>ภูมิภาค (Zone)</label>
            <select className={selectClass} value={formData.zone} onChange={(e) => handleZoneChange(e.target.value)}>
              <option value="">-- เลือกภูมิภาค --</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* จังหวัด */}
          <div>
            <label className={labelClass}>จังหวัด</label>
            <select
              className={selectClass}
              value={formData.province}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={!formData.zone}
            >
              <option value="">-- เลือกจังหวัด --</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* อำเภอ */}
          <div>
            <label className={labelClass}>อำเภอ</label>
            <select
              className={selectClass}
              value={formData.amphoe}
              onChange={(e) => handleAmphoeChange(e.target.value)}
              disabled={!formData.province}
            >
              <option value="">-- เลือกอำเภอ --</option>
              {amphoes.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* ตำบล */}
          <div>
            <label className={labelClass}>ตำบล</label>
            <select
              className={selectClass}
              value={formData.district}
              onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
              disabled={!formData.amphoe}
            >
              <option value="">-- เลือกตำบล --</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* รูปโปรไฟล์ */}
          <div>
            <label className={labelClass}>
              รูปโปรไฟล์ <span className="text-xs text-gray-400">(ไม่บังคับ)</span>
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-yellow-50 flex items-center justify-center flex-shrink-0 border border-yellow-200">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-7 w-7 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-500 cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-bold transition-colors ${
              isLoading
                ? 'bg-yellow-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
            }`}
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-500">มีบัญชีอยู่แล้ว? </span>
            <Link href="/auth/signin" className="font-medium text-gray-800 hover:text-yellow-600 underline underline-offset-2">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
