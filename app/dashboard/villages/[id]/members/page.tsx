import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { getVillage } from '@/app/actions/village'
import MembersTable from './MembersTable'

export default async function VillageMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const village = await getVillage(parseInt(id))
  if (!village) notFound()

  return (
    <div className="max-w-7xl mx-auto space-y-5 print:space-y-0">
      <div className="print:hidden">
        <Link href={`/dashboard/villages/${village.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          กลับไปข้อมูลหมู่บ้าน
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden print:border-none print:shadow-none print:bg-transparent">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between flex-wrap gap-4 print:border-b-2 print:border-black print:px-0 print:py-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-yellow-500 print:hidden" />
              <h1 className="text-xl font-black text-gray-900 print:text-2xl">
                รายชื่อผู้เข้าร่วมโครงการทั้งหมด - บ้าน{village.villageName} หมู่ {village.villageNo}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              ต. {village.tambon} อ. {village.amphoe} จ. {village.province}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>จำนวนผู้เข้าร่วมโครงการในระบบ: <span className="font-bold text-gray-900">{village.persons.length}</span> คน</p>
          </div>
        </div>

        <MembersTable villageId={village.id} persons={village.persons} villageName={village.villageName} />
      </div>
    </div>
  )
}
