import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { prisma } from '@/app/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'โปรไฟล์ | Community Driven' }

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const user = session!.user
  const userId = Number(user.id)

  const villages = await prisma.village.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      persons: {
        include: {
          alcohol: { select: { statusY2: true, statusY3: true } },
          tobacco: { select: { statusY2: true, statusY3: true } },
          dnd:     { select: { year2Result: true, year3Result: true } },
        },
      },
      screeningResults: { take: 1, orderBy: { year: 'desc' } },
    },
  })

  const isIncomplete = (p: { alcohol: { statusY2: string | null; statusY3: string | null } | null; tobacco: { statusY2: string | null; statusY3: string | null } | null; dnd: { year2Result: string | null; year3Result: string | null } | null }) =>
    (p.alcohol && (!p.alcohol.statusY2 || !p.alcohol.statusY3)) ||
    (p.tobacco && (!p.tobacco.statusY2 || !p.tobacco.statusY3)) ||
    (p.dnd    && (!p.dnd.year2Result   || !p.dnd.year3Result))

  const totalPersons   = villages.reduce((s, v) => s + v.persons.length, 0)
  const totalComplete  = villages.reduce((s, v) => s + v.persons.filter(p => !isIncomplete(p)).length, 0)
  const totalIncomplete = totalPersons - totalComplete
  const totalAlcohol   = villages.reduce((s, v) => s + v.persons.filter(p => p.alcohol).length, 0)
  const totalTobacco   = villages.reduce((s, v) => s + v.persons.filter(p => p.tobacco).length, 0)
  const totalDnd       = villages.reduce((s, v) => s + v.persons.filter(p => p.dnd).length, 0)

  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-8">

      {/* ชื่อ */}
      <div className="border-b-2 border-gray-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            {user.image
              ? <img src={user.image} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              : <span className="text-sm font-black text-gray-900">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{user.firstName} {user.lastName}</p>
            <p className="text-[11px] text-gray-500 font-light">{user.email}</p>
          </div>
          <span className="text-[10px] font-semibold text-gray-900 bg-yellow-400 px-2.5 py-1 rounded-full flex-shrink-0">
            {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
          </span>
        </div>
        {(user.province || user.zone) && (
          <p className="text-[11px] text-gray-500 font-light mt-3 pl-13">
            {[user.district, user.amphoe, user.province, user.zone].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {villages.length === 0 ? (
        <p className="text-xs text-gray-500 font-light">ยังไม่มีหมู่บ้านที่ดูแล —{' '}
          <Link href="/dashboard/villages/new" className="text-yellow-600 underline underline-offset-2">เพิ่มหมู่บ้าน</Link>
        </p>
      ) : (
        <>
          {/* ตัวเลขรวม */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-900 font-bold">ภาพรวม</p>
            <div className="grid grid-cols-3 gap-px bg-gray-900 rounded-xl overflow-hidden text-center">
              {[
                { label: 'หมู่บ้าน',   value: villages.length },
                { label: 'สมาชิก',     value: totalPersons },
                { label: 'ประเมินครบ', value: totalComplete },
              ].map(({ label, value }, i) => (
                <div key={label} className={`py-5 px-2 ${i === 0 ? 'bg-yellow-400' : 'bg-gray-950'}`}>
                  <p className={`text-2xl font-light ${i === 0 ? 'text-gray-900' : 'text-white'}`}>{value}</p>
                  <p className={`text-[10px] mt-0.5 ${i === 0 ? 'text-yellow-800' : 'text-gray-500'}`}>{label}</p>
                </div>
              ))}
            </div>

            {/* progress */}
            {totalPersons > 0 && (
              <div className="space-y-1.5">
                <div className="flex rounded-full overflow-hidden h-1.5 bg-gray-200">
                  <div style={{ width: `${(totalComplete / totalPersons) * 100}%` }} className="bg-gray-900" />
                </div>
                <div className="flex justify-between text-[10px] font-light">
                  <span className="text-gray-900 font-medium">ครบแล้ว {totalComplete} คน</span>
                  {totalIncomplete > 0 && <span className="text-gray-400">ยังขาด {totalIncomplete} คน</span>}
                </div>
              </div>
            )}
          </div>

          {/* กลุ่มเสี่ยง */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-900 font-bold">กลุ่มเสี่ยง</p>
            <div className="space-y-0 border border-gray-900 rounded-xl overflow-hidden divide-y divide-gray-900">
              {[
                { label: 'เครื่องดื่มแอลกอฮอล์', value: totalAlcohol },
                { label: 'บุหรี่ / ยาสูบ',        value: totalTobacco },
                { label: 'ดื่มแล้วขับ',            value: totalDnd },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-light text-gray-700">{label}</span>
                  <span className="text-xs font-semibold text-gray-900">{value} <span className="text-gray-400 font-light text-[10px]">คน</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* รายการหมู่บ้าน */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-900 font-bold">หมู่บ้านที่รับผิดชอบ</p>
            <ul className="space-y-0 border border-gray-900 rounded-xl overflow-hidden divide-y divide-gray-900">
              {villages.map((v) => {
                const incomplete = v.persons.filter(p => isIncomplete(p)).length
                const screening  = v.screeningResults[0]
                return (
                  <li key={v.id}>
                    <Link href={`/dashboard/villages/${v.id}`} className="flex items-start justify-between px-4 py-3 hover:bg-yellow-400 transition-colors group">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900">
                            บ้าน{v.villageName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-light">หมู่ {v.villageNo}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-light">
                          {v.tambon} · {v.amphoe} · {v.province}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-gray-600 font-light">{v.persons.length} สมาชิก</span>
                          {screening && <span className="text-[10px] text-gray-400 font-light">· คัดกรอง {screening.screenedCount} คน</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-shrink-0">
                        {incomplete > 0 && (
                          <span className="text-[10px] font-semibold text-gray-900 bg-yellow-400 group-hover:bg-gray-900 group-hover:text-yellow-400 px-1.5 py-0.5 rounded transition-colors">
                            ขาด {incomplete}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs group-hover:text-gray-900 transition-colors">→</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}

    </div>
  )
}
