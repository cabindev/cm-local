import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'

export default async function DashboardHome() {
  const session = await getServerSession(authOptions)
  const user = session!.user

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">ภาพรวม</h2>

      {/* Welcome card */}
      <div className="bg-gray-900 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
          {user.image ? (
            <img src={user.image} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <span className="text-xl font-black text-gray-900">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="text-yellow-400 text-sm">ยินดีต้อนรับ</p>
          <h3 className="text-white text-lg font-bold">{user.firstName} {user.lastName}</h3>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            user.role === 'ADMIN' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-yellow-400'
          }`}>
            {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Zone', value: user.zone || '—' },
          { label: 'จังหวัด', value: user.province || '—' },
          { label: 'อำเภอ', value: user.amphoe || '—' },
          { label: 'ตำบล', value: user.district || '—' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
