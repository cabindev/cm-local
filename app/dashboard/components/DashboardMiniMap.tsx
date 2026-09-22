'use client'

// แผนที่ย่อบนหน้าภาพรวม — อ่านอย่างเดียว ไม่ให้ลาก/ซูม (กันแย่ง scroll ของหน้า)
// ไม่ใส่ตัวหนังสือบนแผนที่ ให้ดูสะอาด · กดที่การ์ดเพื่อไปหน้าแผนที่เต็ม
// ดัดแปลงจาก healthy-impact/app/dashboard/components/DashboardMiniMap.tsx

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Map as LeafletMap } from 'leaflet'
import { ArrowUpRight } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import thailandGeo from '@/app/data/thailand.json'
import type { ProvinceStat } from '@/app/actions/map'
import type { VillageTypeFilter } from '@/app/actions/dashboard'
import { heatColor, heatTheme } from '@/app/lib/map-heat'

export default function DashboardMiniMap({ stats, type }: { stats: ProvinceStat[]; type?: VillageTypeFilter }) {
  const mapElRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  const villageCount = stats.reduce((n, s) => n + s.villages, 0)
  const href = type ? `/dashboard/map?type=${type}` : '/dashboard/map'

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapElRef.current) return

      map = L.map(mapElRef.current, {
        zoomSnap: 0.25,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      })

      const byProvince = new Map(stats.map((s) => [s.province, s.villages]))
      const max = Math.max(1, ...byProvince.values())
      const ramp = heatTheme(type).ramp

      const geoLayer = L.geoJSON(thailandGeo as GeoJSON.GeoJsonObject, {
        interactive: false,
        style: (feature) => ({
          fillColor: heatColor(byProvince.get(feature?.properties?.name_th as string) ?? 0, max, ramp),
          fillOpacity: 0.9,
          color: '#ffffff',
          weight: 0.75,
        }),
      }).addTo(map)

      const m = map
      const fit = () => { m.invalidateSize(); m.fitBounds(geoLayer.getBounds(), { padding: [8, 8], animate: false }) }
      fit()
      timer = setTimeout(fit, 150)
      setReady(true)
    })()
    return () => {
      cancelled = true
      clearTimeout(timer)
      map?.remove()
    }
  }, [stats, type])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">แผนที่หมู่บ้าน</h3>
          <p className="text-xs text-gray-400 mt-0.5">{villageCount} หมู่บ้าน ใน {stats.length} จังหวัด</p>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 hover:text-yellow-800 shrink-0">
          ดูแผนที่เต็ม <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <Link href={href} aria-label="เปิดหน้าแผนที่เต็ม" className="relative block flex-1">
        <div className="h-[280px] rounded-lg overflow-hidden bg-white">
          <div ref={mapElRef} className="h-full w-full" />
        </div>
        {!ready && <span className="absolute inset-0 rounded-lg bg-gray-50 animate-pulse" />}
      </Link>
    </div>
  )
}
