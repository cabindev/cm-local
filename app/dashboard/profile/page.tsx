import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const user = session!.user

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>

      {/* Avatar */}
      <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 ring-4 ring-yellow-100">
          {user.image ? (
            <img src={user.image} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-gray-900">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold ${
            user.role === 'ADMIN' ? 'bg-gray-900 text-yellow-400' : 'bg-yellow-400 text-gray-900'
          }`}>
            {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
          </span>
        </div>
      </div>

      {/* Detail */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายละเอียด</h4>
        {[
          { label: 'ชื่อ', value: user.firstName },
          { label: 'นามสกุล', value: user.lastName },
          { label: 'อีเมล', value: user.email },
          { label: 'รหัสผู้ใช้', value: `#${user.id}` },
          { label: 'สิทธิ์', value: user.role },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-400">{row.label}</span>
            <span className="text-sm font-semibold text-gray-900">{row.value || '—'}</span>
          </div>
        ))}
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">ที่อยู่ / พื้นที่</h4>
        {[
          { label: 'ภูมิภาค (Zone)', value: user.zone },
          { label: 'จังหวัด', value: user.province },
          { label: 'อำเภอ', value: user.amphoe },
          { label: 'ตำบล', value: user.district },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-400">{row.label}</span>
            <span className="text-sm font-semibold text-gray-900">{row.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
