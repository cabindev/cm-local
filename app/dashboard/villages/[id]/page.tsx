import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { MapPin, Pencil, Users, Home, UserCheck } from 'lucide-react'
import DeleteVillageButton from '../components/DeleteVillageButton'
import VillageFormContainer from '../components/VillageFormContainer'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const village = await prisma.village.findUnique({ where: { id: Number(id) } })
  if (!village) return { title: 'ไม่พบข้อมูล' }
  return { title: `บ้าน${village.villageName} | Conmunity` }
}


export default async function VillageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const village = await prisma.village.findUnique({
    where: { id: Number(id) },
    include: {
      communityBackgrounds: true,
      screeningResults: { orderBy: { year: 'asc' } },
      alcoholMembers: { orderBy: { createdAt: 'asc' } },
      tobaccoMembers: { orderBy: { createdAt: 'asc' } },
      drinkNotDriveMembers: { orderBy: { createdAt: 'asc' } },
      envItems: true,
      communityOrgs: true,
    },
  })
  if (!village) notFound()

  const nullToEmpty = (s: string | null) => s ?? ''

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <Link href="/dashboard/villages" className="text-sm text-gray-500 hover:text-yellow-700 inline-flex items-center gap-1">
        ← กลับรายการหมู่บ้าน
      </Link>

      {/* Village Info Card */}
      <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
        <div className="bg-yellow-400 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">บ้าน{village.villageName}</h1>
              <p className="text-xs sm:text-sm text-yellow-800">หมู่ {village.villageNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/dashboard/villages/${village.id}/edit`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-yellow-600 text-gray-900 rounded-lg text-xs sm:text-sm hover:bg-yellow-500 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">แก้ไข</span>
            </Link>
            <DeleteVillageButton id={village.id} name={village.villageName} />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-b border-yellow-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ที่ตั้ง</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[['ตำบล', village.tambon], ['อำเภอ', village.amphoe], ['จังหวัด', village.province]].map(([label, val]) => (
              <div key={label}><p className="text-xs text-gray-400 mb-0.5">{label}</p><p className="text-sm font-medium text-gray-900">{val}</p></div>
            ))}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">ภาค</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">{village.zone}</span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-b border-yellow-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ข้อมูลประชากร</p>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
            {[
              { icon: Users, value: village.registeredPopulation, label: 'ตามทะเบียนบ้าน' },
              { icon: UserCheck, value: village.actualPopulation, label: 'อาศัยอยู่จริง' },
              { icon: Home, value: village.householdCount, label: 'หลังคาเรือน' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-4 text-center">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-base sm:text-xl font-bold text-gray-900">{value.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ผู้ประสานงาน</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gray-900">{village.coordinator.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{village.coordinator}</p>
              {village.phone && <p className="text-xs sm:text-sm text-gray-500">{village.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* All form sections — single save button */}
      <VillageFormContainer
        villageId={village.id}
        data={{
          communityBackgrounds: village.communityBackgrounds,
          screeningResults: village.screeningResults,
          alcoholMembers: village.alcoholMembers.map((m) => ({
            ...m,
            y1MoneyText: nullToEmpty(m.y1MoneyText), y1PropertyText: nullToEmpty(m.y1PropertyText),
            y1FamilyText: nullToEmpty(m.y1FamilyText), y1HealthText: nullToEmpty(m.y1HealthText),
            y1WorkText: nullToEmpty(m.y1WorkText), y1AcceptedText: nullToEmpty(m.y1AcceptedText),
            y1OtherText: nullToEmpty(m.y1OtherText),
            y2MoneyText: nullToEmpty(m.y2MoneyText), y2PropertyText: nullToEmpty(m.y2PropertyText),
            y2FamilyText: nullToEmpty(m.y2FamilyText), y2HealthText: nullToEmpty(m.y2HealthText),
            y2WorkText: nullToEmpty(m.y2WorkText), y2AcceptedText: nullToEmpty(m.y2AcceptedText),
            y2OtherText: nullToEmpty(m.y2OtherText),
            y3MoneyText: nullToEmpty(m.y3MoneyText), y3PropertyText: nullToEmpty(m.y3PropertyText),
            y3FamilyText: nullToEmpty(m.y3FamilyText), y3HealthText: nullToEmpty(m.y3HealthText),
            y3WorkText: nullToEmpty(m.y3WorkText), y3AcceptedText: nullToEmpty(m.y3AcceptedText),
            y3OtherText: nullToEmpty(m.y3OtherText),
          })),
          tobaccoMembers: village.tobaccoMembers.map((m) => ({
            ...m,
            y1MoneyText: nullToEmpty(m.y1MoneyText), y1PropertyText: nullToEmpty(m.y1PropertyText),
            y1FamilyText: nullToEmpty(m.y1FamilyText), y1HealthText: nullToEmpty(m.y1HealthText),
            y1WorkText: nullToEmpty(m.y1WorkText), y1AcceptedText: nullToEmpty(m.y1AcceptedText),
            y1OtherText: nullToEmpty(m.y1OtherText),
            y2MoneyText: nullToEmpty(m.y2MoneyText), y2PropertyText: nullToEmpty(m.y2PropertyText),
            y2FamilyText: nullToEmpty(m.y2FamilyText), y2HealthText: nullToEmpty(m.y2HealthText),
            y2WorkText: nullToEmpty(m.y2WorkText), y2AcceptedText: nullToEmpty(m.y2AcceptedText),
            y2OtherText: nullToEmpty(m.y2OtherText),
            y3MoneyText: nullToEmpty(m.y3MoneyText), y3PropertyText: nullToEmpty(m.y3PropertyText),
            y3FamilyText: nullToEmpty(m.y3FamilyText), y3HealthText: nullToEmpty(m.y3HealthText),
            y3WorkText: nullToEmpty(m.y3WorkText), y3AcceptedText: nullToEmpty(m.y3AcceptedText),
            y3OtherText: nullToEmpty(m.y3OtherText),
          })),
          drinkNotDriveMembers: village.drinkNotDriveMembers.map((m) => ({
            ...m,
            year1Result: nullToEmpty(m.year1Result),
            year2Result: nullToEmpty(m.year2Result),
            year3Result: nullToEmpty(m.year3Result),
          })),
          envItems: village.envItems,
          communityOrgs: village.communityOrgs,
        }}
      />
    </div>
  )
}
