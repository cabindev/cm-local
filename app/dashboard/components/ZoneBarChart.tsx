'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

type ZoneData = { zone: string; villages: number; alcohol: number; tobacco: number; dnd: number }

const LEGEND = [
  { label: 'งดเหล้า',   color: '#facc15' },
  { label: 'งดบุหรี่',  color: '#a16207' },
  { label: 'ดื่มไม่ขับ', color: '#111827' },
]

function ChartLegend() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 8, fontSize: 10, color: '#6b7280' }}>
      {LEGEND.map(({ label, color }) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, backgroundColor: color, display: 'inline-block', borderRadius: 2 }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export default function ZoneBarChart({ data }: { data: ZoneData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">สมาชิกแยกตามภาค</p>
      </div>
      <div className="p-4 min-w-0">
        <ResponsiveContainer width="100%" height={220} minWidth={0}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="zone"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: 'none' }}
              cursor={{ fill: '#fef9c3' }}
            />
            <Legend content={<ChartLegend />} />
            <Bar dataKey="dnd"     name="ดื่มไม่ขับ" fill="#111827" radius={[3, 3, 0, 0]} />
            <Bar dataKey="tobacco" name="งดบุหรี่"  fill="#a16207" radius={[3, 3, 0, 0]} />
            <Bar dataKey="alcohol" name="งดเหล้า"   fill="#facc15" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
