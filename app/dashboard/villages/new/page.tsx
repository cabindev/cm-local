import VillageForm from '../components/VillageForm'

export const metadata = { title: 'เพิ่มหมู่บ้าน | Conmunity' }

export default function NewVillagePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มหมู่บ้าน</h1>
        <p className="text-sm text-gray-500 mt-0.5">ลงทะเบียนหมู่บ้านเข้าร่วมโครงการ</p>
      </div>
      <VillageForm />
    </div>
  )
}
