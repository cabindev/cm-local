import { notFound } from 'next/navigation'
import { getVillageById } from '@/app/actions/village'
import VillageForm from '../../components/VillageForm'

export const metadata = { title: 'แก้ไขหมู่บ้าน | Conmunity' }

export default async function EditVillagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const village = await getVillageById(Number(id))
  if (!village) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขหมู่บ้าน</h1>
        <p className="text-sm text-gray-500 mt-0.5">บ้าน{village.villageName} หมู่ {village.villageNo}</p>
      </div>
      <VillageForm
        defaultValues={{
          id: village.id,
          villageName: village.villageName,
          villageNo: village.villageNo,
          tambon: village.tambon,
          amphoe: village.amphoe,
          province: village.province,
          zone: village.zone,
          coordinator: village.coordinator,
          phone: village.phone ?? '',
        }}
      />
    </div>
  )
}
