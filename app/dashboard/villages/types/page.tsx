import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import VillageTypesEditor from './VillageTypesEditor'

export const metadata = { title: 'ระบุประเภทหมู่บ้าน | Community Driven' }

export default async function VillageTypesPage() {
  await requireAdmin()

  const villages = await prisma.village.findMany({
    orderBy: [{ province: 'asc' }, { amphoe: 'asc' }, { tambon: 'asc' }, { villageName: 'asc' }],
    select: {
      id: true, villageName: true, villageNo: true,
      tambon: true, amphoe: true, province: true,
      isKpiVillage: true, isQualityVillage: true,
    },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link
        href="/dashboard/villages"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        หมู่บ้านทั้งหมด
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ระบุประเภทหมู่บ้าน</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          ติ๊กประเภทของแต่ละหมู่บ้าน แล้วกดบันทึกครั้งเดียว
        </p>
      </div>

      <VillageTypesEditor villages={villages} />
    </div>
  )
}
