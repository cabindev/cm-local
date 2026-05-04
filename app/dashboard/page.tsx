import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'
import { MapPin, Users, Cigarette, Plus, ArrowRight, Wine, Car } from 'lucide-react'
import ZoneBarChart from './components/ZoneBarChart'
import OutcomeDonutChart from './components/OutcomeDonutChart'

const outcomeWhere = {
  OR: [
    { y1Money: true }, { y1Property: true }, { y1Family: true },
    { y1Health: true }, { y1Work: true }, { y1Accepted: true }, { y1Other: true },
  ],
}

async function getDashboardStats() {
  const [
    villageCount,
    alcTotal,
    alcWithOutcome,
    tobTotal,
    tobWithOutcome,
    dndTotal,
    dndWithResult,
    recentVillages,
    villagesWithCounts,
  ] = await Promise.all([
    prisma.village.count(),
    prisma.alcoholMember.count(),
    prisma.alcoholMember.count({ where: outcomeWhere }),
    prisma.tobaccoMember.count(),
    prisma.tobaccoMember.count({ where: outcomeWhere }),
    prisma.drinkNotDriveMember.count(),
    prisma.drinkNotDriveMember.count({ where: { year1Result: { not: null } } }),
    prisma.village.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { alcoholMembers: true, tobaccoMembers: true, drinkNotDriveMembers: true } },
      },
    }),
    prisma.village.findMany({
      select: {
        zone: true,
        registeredPopulation: true,
        _count: { select: { alcoholMembers: true, tobaccoMembers: true, drinkNotDriveMembers: true } },
      },
    }),
  ])

  const alcSuccessRate = alcTotal > 0 ? Math.round((alcWithOutcome / alcTotal) * 100) : 0
  const tobSuccessRate = tobTotal > 0 ? Math.round((tobWithOutcome / tobTotal) * 100) : 0

  const zoneOrder = ['เหนือ', 'กลาง', 'อีสาน', 'ตะวันออก', 'ตะวันตก', 'ใต้บน', 'ใต้ล่าง']
  const zoneMap = new Map<string, { villages: number; alcohol: number; tobacco: number; dnd: number; population: number }>()
  for (const v of villagesWithCounts) {
    const e = zoneMap.get(v.zone) ?? { villages: 0, alcohol: 0, tobacco: 0, dnd: 0, population: 0 }
    zoneMap.set(v.zone, {
      villages: e.villages + 1,
      alcohol: e.alcohol + v._count.alcoholMembers,
      tobacco: e.tobacco + v._count.tobaccoMembers,
      dnd: e.dnd + v._count.drinkNotDriveMembers,
      population: e.population + v.registeredPopulation,
    })
  }
  const zoneData = zoneOrder
    .filter((z) => zoneMap.has(z))
    .map((z) => ({ zone: z, ...zoneMap.get(z)! }))

  const totalPopulation = villagesWithCounts.reduce((s, v) => s + v.registeredPopulation, 0)

  return { villageCount, alcTotal, alcWithOutcome, alcSuccessRate, tobTotal, tobWithOutcome, tobSuccessRate, dndTotal, dndWithResult, recentVillages, zoneData, totalPopulation }
}

const zoneColor: Record<string, string> = {
  'เหนือ': 'bg-blue-100 text-blue-700',
  'กลาง': 'bg-green-100 text-green-700',
  'อีสาน': 'bg-orange-100 text-orange-700',
  'ตะวันออก': 'bg-purple-100 text-purple-700',
  'ตะวันตก': 'bg-pink-100 text-pink-700',
  'ใต้บน': 'bg-teal-100 text-teal-700',
  'ใต้ล่าง': 'bg-cyan-100 text-cyan-700',
}

export default async function DashboardHome() {
  const session = await getServerSession(authOptions)
  const user = session!.user
  const stats = await getDashboardStats()

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">

      {/* Welcome bar — bright yellow */}
      <div className="bg-yellow-400 rounded-2xl px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none">กพร</p>
          <p className="text-xs sm:text-sm text-gray-700 mt-1.5 truncate">
            ยินดีต้อนรับ · <span className="font-semibold">{user.firstName} {user.lastName}</span>
          </p>
        </div>
        <Link
          href="/dashboard/villages/new"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">เพิ่มหมู่บ้าน</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          color="bg-yellow-50 border-yellow-200"
          icon={<MapPin className="w-5 h-5 text-yellow-600" />}
          label="หมู่บ้านทั้งหมด"
          value={stats.villageCount}
          unit="หมู่บ้าน"
          href="/dashboard/villages"
        />
        <StatCard
          color="bg-gray-50 border-gray-200"
          icon={<Users className="w-5 h-5 text-gray-600" />}
          label="ประชากรรวม"
          value={stats.totalPopulation}
          unit="คน"
        />
        <StatCard
          color="bg-orange-50 border-orange-200"
          icon={<Wine className="w-5 h-5 text-orange-500" />}
          label="ผู้สมัครงดเหล้า"
          value={stats.alcTotal}
          unit="คน"
        />
        <StatCard
          color="bg-slate-50 border-slate-200"
          icon={<Cigarette className="w-5 h-5 text-slate-500" />}
          label="ผู้สมัครงดบุหรี่"
          value={stats.tobTotal}
          unit="คน"
        />
        <StatCard
          color="bg-teal-50 border-teal-200"
          icon={<Car className="w-5 h-5 text-teal-600" />}
          label="ดื่มไม่ขับ"
          value={stats.dndTotal}
          unit="คน"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ZoneBarChart data={stats.zoneData} />
        </div>
        <OutcomeDonutChart
          alcSuccess={stats.alcWithOutcome}
          alcTotal={stats.alcTotal}
          tobSuccess={stats.tobWithOutcome}
          tobTotal={stats.tobTotal}
          dndSuccess={stats.dndWithResult}
          dndTotal={stats.dndTotal}
        />
      </div>

      {/* Zone statistics table */}
      {stats.zoneData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">สถิติแยกตามภาค</h2>
            <span className="text-xs text-gray-400">{stats.zoneData.length} ภาค</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-2.5 font-medium text-gray-400">ภาค</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-400">หมู่บ้าน</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-400">ประชากร</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-400">งดเหล้า</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-400">งดบุหรี่</th>
                  <th className="text-right px-5 py-2.5 font-medium text-gray-400">รวม</th>
                </tr>
              </thead>
              <tbody>
                {stats.zoneData.map((z, i) => (
                  <tr
                    key={z.zone}
                    className={`border-b border-gray-50 hover:bg-yellow-50 transition-colors ${i === stats.zoneData.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${zoneColor[z.zone] ?? 'bg-gray-100 text-gray-600'}`}>
                        {z.zone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">{z.villages}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{z.population.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-orange-600 font-medium">{z.alcohol}</td>
                    <td className="px-4 py-3 text-right text-gray-600 font-medium">{z.tobacco}</td>
                    <td className="px-5 py-3 text-right text-gray-900 font-semibold">{z.alcohol + z.tobacco}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-5 py-2.5 text-xs font-semibold text-gray-500">รวมทั้งหมด</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">{stats.villageCount}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">{stats.totalPopulation.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-orange-600">{stats.alcTotal}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">{stats.tobTotal}</td>
                  <td className="px-5 py-2.5 text-right text-xs font-bold text-gray-900">{stats.alcTotal + stats.tobTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Villages */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">หมู่บ้านล่าสุด</h2>
          <Link href="/dashboard/villages" className="text-xs text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1">
            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {stats.recentVillages.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">ยังไม่มีข้อมูลหมู่บ้าน</p>
            <Link href="/dashboard/villages/new" className="mt-3 inline-flex items-center gap-1 text-sm text-yellow-600 hover:underline">
              <Plus className="w-3.5 h-3.5" /> เพิ่มหมู่บ้านแรก
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentVillages.map((v) => (
              <Link
                key={v.id}
                href={`/dashboard/villages/${v.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-xs truncate">
                    บ้าน{v.villageName} <span className="text-gray-400 font-normal">หมู่ {v.villageNo}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">ต.{v.tambon} อ.{v.amphoe} จ.{v.province}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-400 flex-shrink-0">
                  {v._count.alcoholMembers > 0 && <span className="text-orange-500">เหล้า {v._count.alcoholMembers}</span>}
                  {v._count.tobaccoMembers > 0 && <span className="text-gray-500">บุหรี่ {v._count.tobaccoMembers}</span>}
                </div>
                <span className={`flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full ${zoneColor[v.zone] ?? 'bg-gray-100 text-gray-600'}`}>
                  {v.zone}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  color, icon, label, value, unit, href,
}: {
  color: string
  icon: React.ReactNode
  label: string
  value: number
  unit: string
  href?: string
}) {
  const content = (
    <div className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
        <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}
