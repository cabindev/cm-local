import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVillage } from '@/app/actions/village'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { Users, Phone, ChevronLeft } from 'lucide-react'
import DeleteVillageButton from './DeleteVillageButton'
import MembersSidebar from './MembersSidebar'
import CommunityBackgroundEditor from './CommunityBackgroundEditor'
import ScreeningEditor from './ScreeningEditor'
import EnvEditor from './EnvEditor'
import CommunityOrgEditor from './CommunityOrgEditor'
import EvaluationPanel, { EvaluationTrigger } from './EvaluationPanel'

type Props = { params: Promise<{ id: string }> }

export default async function VillageDetailPage({ params }: Props) {
  const { id } = await params
  const village = await getVillage(parseInt(id))
  if (!village) notFound()

  const session = await getServerSession(authOptions)
  const currentUserId = Number(session?.user?.id)
  const isOwner = village.creatorId === currentUserId

  const screening = village.screeningResults[0] ?? null
  const multiRiskCount = village.persons.filter((p) => p.alcohol && p.tobacco && p.dnd).length

  const stats = [
    { label: 'ตามทะเบียนบ้าน', value: village.registeredPopulation, unit: 'คน' },
    { label: 'อาศัยอยู่จริง',   value: village.actualPopulation,    unit: 'คน' },
    { label: 'ครัวเรือน',       value: village.householdCount,       unit: 'หลัง' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Link
        href="/dashboard/villages"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        หมู่บ้านทั้งหมด
      </Link>

      <div className="flex gap-5 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Village header */}
          <div className="bg-white rounded-2xl border border-gray-200">

            {/* Name + actions */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                    บ้าน{village.villageName}
                  </h1>
                  <span className="text-sm text-gray-400">หมู่ {village.villageNo}</span>
                  <span className="bg-yellow-400 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-md">
                    {village.zone}
                  </span>
                  {multiRiskCount > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs font-medium px-2 py-0.5 rounded-md border border-red-100">
                      กลุ่มเสี่ยงรวม {multiRiskCount} คน
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 font-normal mt-1">
                  ต.{village.tambon} · อ.{village.amphoe} · จ.{village.province}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <Link
                  href={`/dashboard/villages/${village.id}/members`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  ผู้เข้าร่วม
                </Link>
                <EvaluationTrigger />
                <Link
                  href={`/dashboard/villages/${village.id}/edit`}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  แก้ไข
                </Link>
                {isOwner && <DeleteVillageButton id={village.id} />}
              </div>
            </div>

            {/* Population stats */}
            <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
              {stats.map(({ label, value, unit }) => (
                <div key={label} className="px-6 py-4">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
                    {value.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-gray-400">{unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Coordinator */}
            <div className="border-t border-gray-100 px-6 py-3 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400 text-[9px] font-bold leading-none">
                  {village.coordinator.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-600">{village.coordinator}</span>
              {village.phone && (
                <>
                  <span className="text-gray-200 select-none">·</span>
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {village.phone}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Content editors */}
          <CommunityBackgroundEditor
            villageId={village.id}
            initial={village.communityBackgrounds}
          />

          <ScreeningEditor
            villageId={village.id}
            initial={screening ? {
              screenedCount:   screening.screenedCount,
              alcoholRiskLow:  screening.alcoholRiskLow,
              alcoholRisk:     screening.alcoholRisk,
              alcoholDanger:   screening.alcoholDanger,
              alcoholAddicted: screening.alcoholAddicted,
              alcoholNone:     screening.alcoholNone,
              tobaccoCount:    screening.tobaccoCount,
              tobaccoNone:     screening.tobaccoNone,
              drinkAndDrive:   screening.drinkAndDrive,
              drinkNotDriveN:  screening.drinkNotDriveN,
            } : null}
          />

          <EnvEditor
            villageId={village.id}
            initial={village.envItems}
          />

          <CommunityOrgEditor
            villageId={village.id}
            initial={village.communityOrgs}
          />

          <EvaluationPanel
            persons={village.persons}
            screening={screening}
            villageId={village.id}
          />
        </div>

        {/* Members sidebar */}
        <MembersSidebar villageId={village.id} persons={village.persons} />
      </div>
    </div>
  )
}
