import Link from 'next/link'
import { getVillages } from '@/app/actions/village'
import { MapPin, Plus } from 'lucide-react'
import VillagesList from './VillagesList'

export const metadata = { title: 'หมู่บ้าน | Community Driven' }

export default async function VillagesPage() {
  const villages = await getVillages()

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">หมู่บ้าน</h1>
          <p className="text-sm text-gray-500 mt-0.5">{villages.length} หมู่บ้านในโครงการ</p>
        </div>
        <Link
          href="/dashboard/villages/new"
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมู่บ้าน
        </Link>
      </div>

      {villages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลหมู่บ้าน</p>
          <p className="text-gray-400 text-sm mt-1">กดปุ่ม "เพิ่มหมู่บ้าน" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <VillagesList villages={villages} />
      )}
    </div>
  )
}
