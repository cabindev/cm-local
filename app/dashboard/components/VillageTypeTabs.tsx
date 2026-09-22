import Link from 'next/link'
import type { VillageTypeFilter } from '@/app/actions/dashboard'

const TYPE_TABS: { key: VillageTypeFilter | undefined; label: string; dot?: string; active: string }[] = [
  { key: undefined, label: 'ทั้งหมด',              active: 'bg-gray-900 text-white border-gray-900' },
  { key: 'kpi',     label: 'หมู่บ้านประเมิน กพร.',  dot: 'bg-yellow-400', active: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
  { key: 'quality', label: 'หมู่บ้านสู้เหล้าคุณภาพ', dot: 'bg-sky-400',    active: 'bg-sky-50 text-sky-800 border-sky-300' },
]

export function parseVillageType(raw: string | undefined): VillageTypeFilter | undefined {
  return raw === 'kpi' || raw === 'quality' ? raw : undefined
}

export default function VillageTypeTabs({
  basePath,
  type,
  counts,
}: {
  basePath: string
  type: VillageTypeFilter | undefined
  counts: { all: number; kpi: number; quality: number }
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TYPE_TABS.map((t) => {
        const isActive = t.key === type
        const count = t.key ? counts[t.key] : counts.all
        return (
          <Link
            key={t.label}
            href={t.key ? `${basePath}?type=${t.key}` : basePath}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm transition-colors ${
              isActive ? t.active : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.dot && <span className={`w-2 h-2 rounded-full ${t.dot}`} />}
            {t.label}
            <span className={`text-xs ${isActive ? 'opacity-80' : 'text-gray-400'}`}>({count})</span>
          </Link>
        )
      })}
    </div>
  )
}
