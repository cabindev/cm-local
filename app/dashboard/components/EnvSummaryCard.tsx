'use client'

import { CheckCircle2, Circle } from 'lucide-react'

type EnvStats = {
  funeralCount: number; funeralPolicy: number; funeralCommunityRule: number
  traditionCount: number; shopCount: number; noAlcoholShop: number
  shopLegalCount: number; nodrinkzoneCount: number
}

type Props = { env: EnvStats; total: number }

export default function EnvSummaryCard({ env, total }: Props) {
  const rows = [
    { label: 'งานศพปลอดเหล้า',           count: env.funeralCount,         sub: [
      { label: 'มีนโยบาย',     n: env.funeralPolicy },
      { label: 'มีกติกาชุมชน', n: env.funeralCommunityRule },
    ]},
    { label: 'งานประเพณีปลอดเหล้า',       count: env.traditionCount,       sub: [] },
    { label: 'ร้านค้าเข้าร่วม',           count: env.shopCount,            sub: [
      { label: 'ไม่ขายเหล้าเลย',          n: env.noAlcoholShop },
      { label: 'เข้าร่วมตามกฎหมาย',       n: env.shopLegalCount },
    ]},
    { label: 'สถานที่ห้ามดื่มห้ามขาย',    count: env.nodrinkzoneCount,     sub: [] },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">สภาพแวดล้อม</p>
        <p className="text-sm font-medium text-white mt-0.5">จำนวนหมู่บ้านที่มีองค์ประกอบ</p>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map(({ label, count, sub }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={label} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {count > 0
                    ? <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-200 flex-shrink-0" />}
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}<span className="text-xs font-normal text-gray-400 ml-1">/ {total} หมู่บ้าน</span></span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-6">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
              {sub.length > 0 && count > 0 && (
                <div className="ml-6 mt-2 flex gap-4">
                  {sub.map(({ label: sl, n }) => (
                    <span key={sl} className="text-xs text-gray-500">
                      {sl}: <span className="font-semibold text-gray-700">{n}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
