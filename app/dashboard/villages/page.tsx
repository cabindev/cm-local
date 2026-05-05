import Link from 'next/link'
import { getVillages, getFilterOptions } from '@/app/actions/village'
import { Plus, Search, MapPin } from 'lucide-react'
import { VillagesTable } from './components/VillagesTable'
import { VillageFilters } from './components/VillageFilters'

export const metadata = { title: 'หมู่บ้าน | Conmunity' }

export default async function VillagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    saved?: string
    page?: string
    limit?: string
    zone?: string
    province?: string
    amphoe?: string
    tambon?: string
  }>
}) {
  const { q, saved, page: pageParam, limit: limitParam, zone, province, amphoe, tambon } = await searchParams

  const savedId = saved ? Number(saved) : null
  const page = Math.max(1, Number(pageParam) || 1)
  const limit = [10, 20, 50, 100].includes(Number(limitParam)) ? Number(limitParam) : 10

  const filters = { q, zone, province, amphoe, tambon }

  const [{ villages, total, totalPages, pageSize }, filterOptions] = await Promise.all([
    getVillages(filters, page, limit),
    getFilterOptions(zone, province, amphoe),
  ])

  // Build export query string (all filters, no pagination)
  const exportParams = new URLSearchParams()
  if (q) exportParams.set('q', q)
  if (zone) exportParams.set('zone', zone)
  if (province) exportParams.set('province', province)
  if (amphoe) exportParams.set('amphoe', amphoe)
  if (tambon) exportParams.set('tambon', tambon)

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
        {/* Preserve filter params across search */}
        {zone && <input type="hidden" name="zone" value={zone} />}
        {province && <input type="hidden" name="province" value={province} />}
        {amphoe && <input type="hidden" name="amphoe" value={amphoe} />}
        {tambon && <input type="hidden" name="tambon" value={tambon} />}
        {limitParam && <input type="hidden" name="limit" value={limitParam} />}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาหมู่บ้าน ตำบล อำเภอ จังหวัด..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-white"
          />
        </div>
      </form>

      {/* Filters */}
      <VillageFilters
        options={filterOptions}
        zone={zone}
        province={province}
        amphoe={amphoe}
        tambon={tambon}
        limit={limit}
      />

      {/* Table */}
      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-200 py-20">
          <MapPin className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">ไม่พบข้อมูลหมู่บ้าน</p>
          <Link href="/dashboard/villages/new" className="mt-3 text-xs text-yellow-600 hover:underline">
            + เพิ่มหมู่บ้านแรก
          </Link>
        </div>
      ) : (
        <VillagesTable
          villages={villages}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          q={q}
          zone={zone}
          province={province}
          amphoe={amphoe}
          tambon={tambon}
          savedId={savedId}
          exportQuery={exportParams.toString()}
        />
      )}
    </div>
  )
}
