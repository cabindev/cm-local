import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { redirect } from 'next/navigation'
import RoleToggle from './RoleToggle'
import { Shield, User as UserIcon } from 'lucide-react'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const currentUserId = Number(session.user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-gray-500 mt-0.5">กำหนดสิทธิ์การเข้าถึงข้อมูลระบบ (Admin / Member)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ผู้ใช้งาน</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">สิทธิ์ Admin</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${u.role === 'ADMIN' ? 'bg-gray-900 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {u.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <RoleToggle userId={u.id} initialRole={u.role} currentUserId={currentUserId} />
                    <span className={`text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'text-gray-900' : 'text-gray-300'}`}>
                      {u.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('th-TH', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
