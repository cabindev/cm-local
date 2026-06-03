import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import VillageForm from '../VillageForm'

export const metadata = { title: 'เพิ่มหมู่บ้าน | Community Driven' }

export default function NewVillagePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/villages"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          หมู่บ้านทั้งหมด
        </Link>
        <h1 className="text-2xl font-black text-gray-900">เพิ่มหมู่บ้าน</h1>
        <p className="text-sm text-gray-500 mt-1">ลงทะเบียนหมู่บ้านเข้าร่วมโครงการ กพร.</p>
      </div>
      <VillageForm />
    </div>
  )
}
