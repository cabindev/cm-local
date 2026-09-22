'use client'

// แผนที่รายจังหวัด — ระบายสีตามตัวชี้วัด + ป้ายชื่อจังหวัดและจำนวนกลาง polygon
// ปักป้ายเฉพาะจังหวัดที่มีข้อมูล (ถ้าปักครบ 77 จังหวัด ตัวหนังสือจะทับกันจนอ่านไม่ออก)
// คลิกจังหวัด (บนแผนที่หรือในรายการ) → ซูมไปจังหวัดนั้น จังหวัดอื่นจางลง แผงขวาแสดงรายชื่อหมู่บ้าน
// ดัดแปลงจาก healthy-impact/app/dashboard/map/MapView.tsx
// Leaflet ต้องมี window — import ใน useEffect เท่านั้น

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Map as LeafletMap, GeoJSON as GeoJSONLayer, LatLngBounds, Marker, Path } from 'leaflet'
import { X, ChevronRight } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import thailandGeo from '@/app/data/thailand.json'
import type { ProvinceStat } from '@/app/actions/map'
import type { VillageTypeFilter } from '@/app/actions/dashboard'
import { PROVINCE_ZONE } from '@/app/lib/province-zone'
import { HEAT_EMPTY, heatColor, heatTheme, isDarkStep } from '@/app/lib/map-heat'
import VillageTypeBadges from '../villages/VillageTypeBadges'

type Metric = 'villages' | 'persons' | 'screened'
const METRICS: { value: Metric; label: string }[] = [
  { value: 'villages', label: 'หมู่บ้าน' },
  { value: 'persons',  label: 'สมาชิก' },
  { value: 'screened', label: 'คัดกรองแล้ว' },
]

export default function MapView({ stats, type }: { stats: ProvinceStat[]; type?: VillageTypeFilter }) {
  const mapElRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const geoLayerRef = useRef<GeoJSONLayer | null>(null)
  const labelsRef = useRef<Marker[]>([])
  const boundsRef = useRef<Map<string, LatLngBounds>>(new Map())
  const fullBoundsRef = useRef<LatLngBounds | null>(null)

  const [ready, setReady] = useState(false)
  const [metric, setMetric] = useState<Metric>('villages')
  const [zoomTick, setZoomTick] = useState(0)
  const [selected, setSelected] = useState('')

  const theme = heatTheme(type)
  const byProvince = useMemo(() => new Map(stats.map((s) => [s.province, s])), [stats])
  const max = useMemo(() => Math.max(1, ...stats.map((s) => s[metric])), [stats, metric])
  const ranked = useMemo(() => [...stats].sort((a, b) => b[metric] - a[metric]), [stats, metric])
  const metricLabel = METRICS.find((m) => m.value === metric)!.label
  const selectedStat = selected ? byProvince.get(selected) : undefined

  // สร้างแผนที่ครั้งเดียว
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapElRef.current || mapRef.current) return

      // zoomSnap 0.25 ให้ fitBounds ใช้ซูมเศษส่วนได้ ประเทศไทยจะเต็มกรอบพอดี
      const map = L.map(mapElRef.current, { zoomControl: false, zoomSnap: 0.25 }).setView([13.5, 101], 6)
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.35, // จางไว้ให้สีจังหวัดเด่น แต่ยังเห็นภูมิประเทศเป็นบริบท
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const geoLayer = L.geoJSON(thailandGeo as GeoJSON.GeoJsonObject, {
        style: { fillColor: HEAT_EMPTY, fillOpacity: 0.85, color: '#ffffff', weight: 1 },
        onEachFeature: (feature, layer) => {
          const name = feature?.properties?.name_th as string
          if (!name) return
          boundsRef.current.set(name, (layer as GeoJSONLayer).getBounds())
          layer.bindTooltip(name, { sticky: true })
          layer.on('click', () => setSelected((prev) => (prev === name ? '' : name)))
        },
      }).addTo(map)

      // กรอบแผนที่อาจยังไม่ได้ขนาดจริงตอนสร้าง (โหลดผ่าน next/dynamic) — วัดใหม่แล้วค่อย fit
      fullBoundsRef.current = geoLayer.getBounds()
      const fit = () => { map.invalidateSize(); map.fitBounds(geoLayer.getBounds(), { padding: [28, 28], animate: false }) }
      fit()
      timer = setTimeout(fit, 150)
      map.on('zoomend', () => setZoomTick((t) => t + 1))
      mapRef.current = map
      geoLayerRef.current = geoLayer
      setReady(true)
    })()
    return () => {
      cancelled = true
      clearTimeout(timer)
      mapRef.current?.remove()
      mapRef.current = null
      geoLayerRef.current = null
    }
  }, [])

  // ระบายสี + ข้อความ tooltip · จังหวัดที่เลือกมีเส้นขอบเข้ม จังหวัดอื่นจางลง
  useEffect(() => {
    if (!ready) return
    geoLayerRef.current?.setStyle((feature) => {
      const name = feature?.properties?.name_th as string
      const isSel = name === selected
      return {
        fillColor: heatColor(byProvince.get(name)?.[metric] ?? 0, max, theme.ramp),
        fillOpacity: selected && !isSel ? 0.25 : 0.85,
        color: isSel ? '#111827' : '#ffffff',
        weight: isSel ? 2.5 : 1,
      }
    })
    geoLayerRef.current?.eachLayer((layer) => {
      const name = (layer as GeoJSONLayer & { feature?: GeoJSON.Feature }).feature?.properties?.name_th as string
      if (!name) return
      if (name === selected) (layer as Path).bringToFront()
      const s = byProvince.get(name)
      layer.getTooltip()?.setContent(
        s
          ? `<b>${name}</b><br/>${s.villages} หมู่บ้าน · สมาชิก ${s.persons.toLocaleString()} · คัดกรอง ${s.screened.toLocaleString()}`
          : `<b>${name}</b><br/>ยังไม่มีหมู่บ้าน`
      )
    })
  }, [ready, byProvince, metric, max, selected, theme.ramp])

  // ซูมไปจังหวัดที่เลือก · ยกเลิกเลือกแล้วกลับเป็นทั้งประเทศ
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const bounds = selected ? boundsRef.current.get(selected) : fullBoundsRef.current
    if (bounds) mapRef.current.fitBounds(bounds, { padding: selected ? [48, 48] : [28, 28], maxZoom: 9 })
  }, [ready, selected])

  // ป้ายชื่อจังหวัด + จำนวน กลาง polygon — เฉพาะจังหวัดที่มีข้อมูล (เลือกจังหวัดอยู่ → แสดงแค่จังหวัดนั้น)
  useEffect(() => {
    if (!ready || !mapRef.current) return
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current
      if (cancelled || !map) return
      labelsRef.current.forEach((m) => m.remove())
      labelsRef.current = []
      for (const s of stats) {
        const value = s[metric]
        const bounds = boundsRef.current.get(s.province)
        if (value <= 0 || !bounds) continue
        if (selected && s.province !== selected) continue
        // จังหวัดเล็ก (กรุงเทพฯ นนทบุรี ฯลฯ) ชื่อยาวกว่าตัว polygon ที่ระดับซูมทั้งประเทศ
        // จึงโชว์แค่ตัวเลขก่อน แล้วค่อยมีชื่อเมื่อซูมจนกว้างพอ (26px วัดจากของจริงใน healthy-impact)
        const widthPx =
          map.latLngToContainerPoint(bounds.getNorthEast()).x -
          map.latLngToContainerPoint(bounds.getNorthWest()).x
        const showName = widthPx >= 26
        const dark = isDarkStep(value, max)
        labelsRef.current.push(
          L.marker(bounds.getCenter(), {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({
              className: 'cm-prov-label',
              iconSize: [0, 0],
              html: `<span class="cm-prov ${dark ? 'cm-prov-on-dark' : ''}">${
                showName ? `<b>${s.province}</b>` : ''
              }<i>${value.toLocaleString()}</i></span>`,
            }),
          }).addTo(map)
        )
      }
    })()
    return () => { cancelled = true }
  }, [ready, stats, metric, max, zoomTick, selected])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div ref={mapElRef} className="h-[68vh] min-h-[460px] w-full" />
        {!ready && <div className="absolute inset-0 bg-gray-50 animate-pulse" />}

        {/* ตัวชี้วัด */}
        <div className="absolute top-3 left-3 z-[1000] inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          {METRICS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMetric(m.value)}
              aria-pressed={metric === m.value}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                metric === m.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* กลับไปดูทั้งประเทศ */}
        {selected && (
          <button
            type="button"
            onClick={() => setSelected('')}
            className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <X className="w-3.5 h-3.5" /> ดูทั้งประเทศ
          </button>
        )}

        {/* คำอธิบายสี */}
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-600 shadow-sm">
          <span>น้อย</span>
          <span className="flex">
            {[HEAT_EMPTY, ...theme.ramp].map((c) => <span key={c} className="w-4 h-2" style={{ background: c }} />)}
          </span>
          <span>มาก</span>
        </div>
      </div>

      {/* แผงขวา: จังหวัดที่เลือก หรือ อันดับจังหวัด */}
      <aside className="bg-white rounded-2xl border border-gray-200 flex flex-col lg:h-[68vh] lg:min-h-[460px] overflow-hidden">
        {selected ? (
          <>
            <div className="px-4 py-3 border-b border-gray-100" style={{ background: theme.selected }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500">
                    {PROVINCE_ZONE[selected] ? `ภาค${PROVINCE_ZONE[selected]}` : 'จังหวัดที่เลือก'}
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">{selected}</h2>
                </div>
                <button type="button" aria-label="ยกเลิกเลือกจังหวัด" onClick={() => setSelected('')}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2">
                {METRICS.map(({ value, label }) => (
                  <div key={value} className="rounded-lg bg-white px-2.5 py-2">
                    <dt className="text-[10px] text-gray-500">{label}</dt>
                    <dd className="text-base font-semibold text-gray-900 tabular-nums">
                      {(selectedStat?.[value] ?? 0).toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>
              {selectedStat && (
                <p className="mt-2 text-xs text-gray-500">
                  ประเมิน กพร. {selectedStat.kpi} · สู้เหล้าคุณภาพ {selectedStat.quality}
                </p>
              )}
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {selectedStat?.list.map((v) => (
                <li key={v.id}>
                  <Link href={`/dashboard/villages/${v.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 group">
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-gray-800 truncate group-hover:text-yellow-700">
                        บ้าน{v.villageName} <span className="text-xs text-gray-400">หมู่ {v.villageNo}</span>
                      </span>
                      <span className="block text-xs text-gray-400 truncate">ต.{v.tambon} อ.{v.amphoe}</span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        <VillageTypeBadges isKpiVillage={v.isKpiVillage} isQualityVillage={v.isQualityVillage} short />
                      </span>
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums">{v.persons} คน</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                </li>
              ))}
              {!selectedStat && (
                <li className="px-4 py-10 text-center text-sm text-gray-400">จังหวัดนี้ยังไม่มีหมู่บ้าน</li>
              )}
            </ul>
          </>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">รายจังหวัด</p>
              <p className="text-xs text-gray-400">เรียงตาม{metricLabel} · คลิกเพื่อดูรายจังหวัด</p>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {ranked.map((s) => (
                <li key={s.province}>
                  <button type="button" onClick={() => setSelected(s.province)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 border border-black/5"
                        style={{ background: heatColor(s[metric], max, theme.ramp) }} />
                      <span className="flex-1 text-sm text-gray-700 truncate">{s.province}</span>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{s[metric].toLocaleString()}</span>
                    </span>
                    <span className="block ml-4.5 mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${(s[metric] / max) * 100}%`, background: theme.bar }} />
                    </span>
                  </button>
                </li>
              ))}
              {ranked.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-gray-400">ยังไม่มีหมู่บ้านในกลุ่มนี้</li>
              )}
            </ul>
          </>
        )}
      </aside>
    </div>
  )
}
