import { getDashboardStats } from '@/app/actions/dashboard'
import { Users, MapPin, ClipboardList, TrendingUp } from 'lucide-react'
import ZoneBarChart from './components/ZoneBarChart'
import ProgressFunnel from './components/ProgressFunnel'
import ScreeningRiskChart from './components/ScreeningRiskChart'
import EnvSummaryCard from './components/EnvSummaryCard'
import OrgParticipationChart from './components/OrgParticipationChart'

export const metadata = { title: 'ภาพรวม | Community Driven' }

function KpiCard({ icon: Icon, label, value, sub, accent = false }: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 flex items-start gap-4 ${accent ? 'bg-yellow-400' : 'bg-white border border-gray-200'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-gray-900/10' : 'bg-yellow-400'}`}>
        <Icon className="w-5 h-5 text-gray-900" />
      </div>
      <div>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        <p className={`text-sm font-normal ${accent ? 'text-gray-800' : 'text-gray-600'}`}>{label}</p>
        {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-yellow-800' : 'text-gray-400'}`}>{sub}</p>}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const s = await getDashboardStats()

  const zoneChartData = s.byZone.map(z => ({
    zone: z.zone,
    villages: z.villages,
    alcohol: z.alcohol,
    tobacco: z.tobacco,
    dnd: z.dnd,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={MapPin}        label="หมู่บ้าน"       value={s.villageCount}                 sub={`${s.byZone.length} ภาค`}                                         accent />
        <KpiCard icon={Users}         label="สมาชิกทั้งหมด"  value={s.personCount.toLocaleString()}  sub="ที่ลงทะเบียน" />
        <KpiCard icon={ClipboardList} label="คัดกรองแล้ว"    value={s.screenedTotal.toLocaleString()} sub={`จากประชากร ${s.populationTotal.toLocaleString()} คน`} />
        <KpiCard icon={TrendingUp}    label="Coverage"       value={`${s.coveragePct}%`}            sub={`${s.screeningVillages} หมู่บ้านมีข้อมูล`} />
      </div>

      {/* Screening + Env */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScreeningRiskChart alc={s.alc} tob={s.tob} dnd={s.dnd} screened={s.screenedTotal} />
        <EnvSummaryCard env={s.env} total={s.villageCount} />
      </div>

      {/* Outcomes */}
      <ProgressFunnel
        alcTotal={s.outcomes.alcTotal} alcY1={s.outcomes.alcY1} alcY2={s.outcomes.alcY2} alcY3={s.outcomes.alcY3} alcDeceased={s.outcomes.alcDeceased}
        tobTotal={s.outcomes.tobTotal} tobY1={s.outcomes.tobY1} tobY2={s.outcomes.tobY2} tobY3={s.outcomes.tobY3} tobDeceased={s.outcomes.tobDeceased}
        dndTotal={s.outcomes.dndTotal} dndY1={s.outcomes.dndY1} dndY2={s.outcomes.dndY2} dndY3={s.outcomes.dndY3} dndDeceased={s.outcomes.dndDeceased}
      />

      {/* Org + Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrgParticipationChart orgParticipation={s.orgParticipation} total={s.villageCount} />
        <ZoneBarChart data={zoneChartData} />
      </div>

    </div>
  )
}
