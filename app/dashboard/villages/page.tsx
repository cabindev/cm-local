import Link from 'next/link'
import { getVillages } from '@/app/actions/village'
import { Plus, Search, MapPin } from 'lucide-react'

export const metadata = { title: 'หมู่บ้าน | Conmunity' }

const zoneColor: Record<string, string> = {
  'เหนือ': 'bg-blue-100 text-blue-700',
  'กลาง': 'bg-green-100 text-green-700',
  'อีสาน': 'bg-orange-100 text-orange-700',
  'ตะวันออก': 'bg-purple-100 text-purple-700',
  'ตะวันตก': 'bg-pink-100 text-pink-700',
  'ใต้บน': 'bg-teal-100 text-teal-700',
  'ใต้ล่าง': 'bg-cyan-100 text-cyan-700',
}

export default async function VillagesPage({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string }> }) {
  const { q, saved } = await searchParams
  const savedId = saved ? Number(saved) : null
  const villages = await getVillages(q)

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">หมู่บ้าน</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">กพร</p>
        </div>
        <Link
          href="/dashboard/villages/new"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มหมู่บ้าน</span>
        </Link>
      </div>

      {/* Search */}
      <form>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาหมู่บ้าน ตำบล อำเภอ..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-white"
          />
        </div>
      </form>

      {/* Table */}
      {villages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-200 py-20">
          <MapPin className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">ยังไม่มีข้อมูลหมู่บ้าน</p>
          <Link href="/dashboard/villages/new" className="mt-3 text-xs text-yellow-600 hover:underline">
            + เพิ่มหมู่บ้านแรก
          </Link>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">

          <div className="px-4 py-2.5 border-b border-gray-100 text-xs text-gray-400">
            ทั้งหมด <span className="font-semibold text-gray-700">{villages.length}</span> หมู่บ้าน
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 w-8">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400">ชื่อหมู่บ้าน</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 w-12 hidden sm:table-cell">หมู่</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 hidden md:table-cell">ตำบล</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 hidden md:table-cell">อำเภอ</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 hidden sm:table-cell">จังหวัด</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 w-20 hidden lg:table-cell">ภาค</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-400 w-24 hidden lg:table-cell">ประชากร</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-400 hidden xl:table-cell">ผู้ประสานงาน</th>
                  <th className="w-16 px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {villages.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b border-gray-50 hover:bg-yellow-50 transition-colors ${i === villages.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-300">{i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/villages/${v.id}`}
                          className="font-medium text-gray-900 hover:text-yellow-700 transition-colors"
                        >
                          บ้าน{v.villageName}
                        </Link>
                        {savedId === v.id && (
                          <span className="px-1.5 py-0.5 bg-yellow-400 text-gray-900 text-[10px] font-bold rounded-full whitespace-nowrap">
                            ล่าสุด
                          </span>
                        )}
                      </div>
                      {/* Mobile: show province + zone inline */}
                      <div className="sm:hidden mt-0.5 flex items-center gap-1.5">
                        <span className="text-gray-400">{v.province}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${zoneColor[v.zone] ?? 'bg-gray-100 text-gray-600'}`}>
                          {v.zone}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{v.villageNo}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{v.tambon}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{v.amphoe}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{v.province}</td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${zoneColor[v.zone] ?? 'bg-gray-100 text-gray-600'}`}>
                        {v.zone}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell">
                      {v.registeredPopulation.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-gray-400 hidden xl:table-cell">{v.coordinator}</td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/villages/${v.id}/edit`}
                        className="px-2.5 py-1 border border-gray-200 text-gray-500 rounded-lg hover:border-yellow-400 hover:text-yellow-700 transition-colors whitespace-nowrap"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
