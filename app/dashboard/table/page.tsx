import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function TablePage() {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      zone: true,
      province: true,
      amphoe: true,
      district: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">ตารางข้อมูลผู้ใช้</h2>
        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
          {users.length} รายการ
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['#', 'ชื่อ-นามสกุล', 'อีเมล', 'Zone', 'จังหวัด', 'อำเภอ', 'ตำบล', 'สิทธิ์', 'วันที่สมัคร'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} className={`border-b border-gray-50 last:border-0 hover:bg-yellow-50 transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/40' : ''}`}>
                <td className="px-4 py-3 text-gray-400 font-mono">{u.id}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.zone || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{u.province || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{u.amphoe || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{u.district || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    u.role === 'ADMIN' ? 'bg-gray-900 text-yellow-400' : 'bg-yellow-400 text-gray-900'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
