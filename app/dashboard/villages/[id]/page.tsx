import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVillage } from '@/app/actions/village'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { MapPin, Users, Home, Phone, ArrowLeft } from 'lucide-react'
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

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Link href="/dashboard/villages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        กลับรายการหมู่บ้าน
      </Link>

      <div className="flex gap-5 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Village header */}
          <div className="bg-yellow-400 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-black text-gray-900">บ้าน{village.villageName}</h1>
                    {multiRiskCount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-gray-900 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                        กลุ่มเสี่ยงรวม {multiRiskCount} คน
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-yellow-800">หมู่ {village.villageNo}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Link
                  href={`/dashboard/villages/${village.id}/members`}
                  className="px-3 py-1.5 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-yellow-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" />
                  ดูผู้เข้าร่วมโครงการทั้งหมด
                </Link>
                <EvaluationTrigger />
                <Link
                  href={`/dashboard/villages/${village.id}/edit`}
                  className="px-3 py-1.5 text-xs font-semibold bg-white/60 hover:bg-white/80 text-gray-900 rounded-lg transition-colors"
                >
                  แก้ไข
                </Link>
                {isOwner && <DeleteVillageButton id={village.id} />}
              </div>
            </div>

            {/* Location */}
            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
              {[
                { label: 'ตำบล', value: village.tambon },
                { label: 'อำเภอ', value: village.amphoe },
                { label: 'จังหวัด', value: village.province },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-yellow-800 text-xs">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-yellow-800 text-xs">ภาค</p>
                <span className="inline-block bg-gray-900 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-md">
                  {village.zone}
                </span>
              </div>
            </div>

            {/* Population */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: 'ตามทะเบียนบ้าน', value: village.registeredPopulation },
                { icon: Users, label: 'อาศัยอยู่จริง', value: village.actualPopulation },
                { icon: Home, label: 'หลังคาเรือน', value: village.householdCount },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/50 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}</p>
                  <p className="text-xs text-yellow-800 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Coordinator */}
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-yellow-400 text-xs font-bold">{village.coordinator.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{village.coordinator}</p>
                {village.phone && (
                  <p className="text-xs text-yellow-800 flex items-center gap-1">
                    <Phone className="w-3 h-3" />{village.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Community Background — interactive editor */}
          <CommunityBackgroundEditor
            villageId={village.id}
            initial={village.communityBackgrounds}
          />

          {/* Screening Result — interactive editor */}
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

          {/* สภาพแวดล้อม */}
          <EnvEditor
            villageId={village.id}
            initial={village.envItems}
          />

          {/* การมีส่วนร่วมของชุมชน */}
          <CommunityOrgEditor
            villageId={village.id}
            initial={village.communityOrgs}
          />

          {/* ผลการประเมิน 3 ปี — collapse panel */}
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
