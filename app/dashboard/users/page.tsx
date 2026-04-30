import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'

const prisma = new PrismaClient()

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      province: true,
      zone: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">รายชื่อสมาชิก</h2>
        <span className="text-sm text-gray-400">{users.length} คน</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid gap-0">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
            <div>ชื่อ</div>
            <div>อีเมล</div>
            <div>Zone</div>
            <div>จังหวัด</div>
            <div>สิทธิ์</div>
          </div>

          {users.map((u, idx) => (
            <div
              key={u.id}
              className={`grid grid-cols-1 sm:grid-cols-5 px-6 py-4 gap-1 sm:gap-0 items-center border-b border-gray-50 last:border-0 ${idx % 2 === 0 ? '' : 'bg-gray-50/50'}`}
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-900">
                    {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{u.firstName} {u.lastName}</span>
              </div>
              <div className="text-sm text-gray-500 truncate">{u.email}</div>
              <div className="text-sm text-gray-600">{u.zone || '—'}</div>
              <div className="text-sm text-gray-600">{u.province || '—'}</div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  u.role === 'ADMIN' ? 'bg-gray-900 text-yellow-400' : 'bg-yellow-400 text-gray-900'
                }`}>
                  {u.role === 'ADMIN' ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
