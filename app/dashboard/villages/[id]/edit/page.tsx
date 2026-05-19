import { notFound } from 'next/navigation'
import { getVillage } from '@/app/actions/village'
import VillageEditForm from './VillageEditForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = { params: Promise<{ id: string }> }

export default async function EditVillagePage({ params }: Props) {
  const { id } = await params
  const village = await getVillage(parseInt(id))
  if (!village) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href={`/dashboard/villages/${village.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับ บ้าน{village.villageName}
      </Link>

      <div>
        <h1 className="text-2xl font-black text-gray-900">แก้ไขข้อมูลหมู่บ้าน</h1>
        <p className="text-sm text-gray-500 mt-0.5">บ้าน{village.villageName} หมู่ {village.villageNo}</p>
      </div>

      <VillageEditForm village={village} />
    </div>
  )
}
