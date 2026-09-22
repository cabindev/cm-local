import dynamicImport from 'next/dynamic'
import { getProvinceStats } from '@/app/actions/map'
import { getDashboardStats } from '@/app/actions/dashboard'
import VillageTypeTabs, { parseVillageType } from '../components/VillageTypeTabs'

export const metadata = { title: 'แผนที่ | Community Driven' }

// แยก bundle ของ Leaflet + GeoJSON ออกจากหน้าอื่น
const MapView = dynamicImport(() => import('./MapView'), {
  loading: () => <div className="h-[68vh] min-h-[460px] rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />,
})

type Props = { searchParams: Promise<{ type?: string }> }

export default async function MapPage({ searchParams }: Props) {
  const { type: rawType } = await searchParams
  const type = parseVillageType(rawType)
  const [provinces, dash] = await Promise.all([getProvinceStats(type), getDashboardStats()])
  const villageCount = provinces.reduce((n, p) => n + p.villages, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">แผนที่หมู่บ้าน</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {villageCount} หมู่บ้าน ใน {provinces.length} จังหวัด
        </p>
      </div>

      <VillageTypeTabs basePath="/dashboard/map" type={type} counts={dash.typeCounts} />

      <MapView stats={provinces} type={type} />
    </div>
  )
}
