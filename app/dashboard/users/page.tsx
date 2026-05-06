import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { prisma } from '@/app/lib/prisma'
import { RoleToggle } from './RoleToggle'

export const metadata = { title: 'สมาชิก | Conmunity' }

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
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">รายชื่อสมาชิก</h1>
        <span className="text-xs text-gray-400 bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full font-medium">
          {users.length} คน
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-6 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
          <div className="col-span-2">ชื่อ-นามสกุล</div>
          <div>อีเมล</div>
          <div>ภาค</div>
          <div>จังหวัด</div>
          <div>สิทธิ์</div>
        </div>

        {users.map((u, idx) => {
          const isSelf = session?.user?.id === u.id
          return (
            <div
              key={u.id}
              className={`grid grid-cols-1 sm:grid-cols-6 px-5 py-3.5 gap-2 sm:gap-0 items-center border-b border-gray-50 last:border-0 transition-colors hover:bg-yellow-50 ${
                isSelf ? 'bg-yellow-50/60' : idx % 2 !== 0 ? 'bg-gray-50/30' : ''
              }`}
            >
              {/* Avatar + Name */}
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-900">
                    {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-gray-400 sm:hidden">{u.email}</p>
                </div>
              </div>

              <div className="hidden sm:block text-xs text-gray-500 truncate pr-2">{u.email}</div>
              <div className="hidden sm:block text-xs text-gray-500">{u.zone || '—'}</div>
              <div className="hidden sm:block text-xs text-gray-500">{u.province || '—'}</div>

              {/* Role Toggle */}
              <div>
                <RoleToggle
                  userId={u.id}
                  currentRole={u.role as 'ADMIN' | 'MEMBER'}
                  isSelf={isSelf}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
