import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { prisma } from '@/app/lib/prisma'

export const metadata = { title: 'โปรไฟล์ | Conmunity' }

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const user = session!.user

  const [villageCount, popAgg, screenAgg, alcoholCount, tobaccoCount, dndCount] = await Promise.all([
    prisma.village.count({ where: { creatorId: user.id } }),
    prisma.village.aggregate({ where: { creatorId: user.id }, _sum: { registeredPopulation: true } }),
    prisma.screeningResult.aggregate({ where: { village: { creatorId: user.id } }, _sum: { screenedCount: true } }),
    prisma.alcoholMember.count({ where: { village: { creatorId: user.id } } }),
    prisma.tobaccoMember.count({ where: { village: { creatorId: user.id } } }),
    prisma.drinkNotDriveMember.count({ where: { village: { creatorId: user.id } } }),
  ])

  const totalPop    = popAgg._sum.registeredPopulation ?? 0
  const totalScreen = screenAgg._sum.screenedCount ?? 0
  const coveragePct = totalPop > 0 ? Math.round((totalScreen / totalPop) * 100) : 0

  return (
    <div className="flex items-center justify-center min-h-full py-12 px-4">
      <div className="w-full max-w-[360px] space-y-3">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="h-1.5 bg-yellow-400" />
          <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-3">

            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center ring-4 ring-yellow-50 shadow-sm">
              {user.image
                ? <img src={user.image} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                : <span className="text-xl font-black text-gray-900 tracking-tight">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
              }
            </div>

            <div>
              <p className="text-base font-bold text-gray-900 leading-snug">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            </div>

            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
              user.role === 'ADMIN' ? 'bg-gray-900 text-yellow-400' : 'bg-yellow-400 text-gray-900'
            }`}>
              {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
            </span>

            {(user.zone || user.province) && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {user.zone     && <span className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-[10px] rounded-full">{user.zone}</span>}
                {user.province && <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] rounded-full">{user.province}</span>}
                {user.amphoe   && <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] rounded-full">{user.amphoe}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ข้อมูลของฉัน</p>
          </div>

          {villageCount === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400">ยังไม่มีหมู่บ้านที่คุณเพิ่มเข้ามา</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
                {[
                  { label: 'หมู่บ้าน',    value: villageCount, unit: 'แห่ง', accent: true  },
                  { label: 'ประชากร',     value: totalPop,     unit: 'คน',  accent: false },
                  { label: 'งดเหล้า',     value: alcoholCount, unit: 'คน',  accent: false },
                  { label: 'งดบุหรี่',    value: tobaccoCount, unit: 'คน',  accent: false },
                  { label: 'ดื่มไม่ขับ', value: dndCount,     unit: 'คน',  accent: false },
                  { label: 'คัดกรอง',    value: totalScreen,  unit: 'คน',  accent: false },
                ].map(({ label, value, unit, accent }) => (
                  <div key={label} className="px-5 py-4">
                    <p className={`text-2xl font-black leading-none ${accent ? 'text-yellow-500' : 'text-gray-900'}`}>
                      {value.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {label} <span className="text-gray-300">·</span> {unit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-gray-500">อัตราคัดกรองประชากร</p>
                  <p className="text-sm font-black text-gray-900">
                    {coveragePct}<span className="text-xs font-medium text-gray-400 ml-0.5">%</span>
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${Math.min(coveragePct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-300 mt-1.5">
                  <span>{totalScreen.toLocaleString()} คนที่คัดกรอง</span>
                  <span>เป้า {totalPop.toLocaleString()} คน</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {[
            { label: 'รหัสผู้ใช้', value: `#${user.id}` },
            { label: 'ตำบล',       value: user.district },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex justify-between items-center px-5 py-3 text-xs">
              <span className="text-gray-400">{row.label}</span>
              <span className="font-medium text-gray-700">{row.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
