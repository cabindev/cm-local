'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

type ZoneData = { zone: string; villages: number; alcohol: number; tobacco: number; dnd: number }

export default function ZoneBarChart({ data }: { data: ZoneData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ภาพรวม</p>
        <p className="text-sm font-medium text-white mt-0.5">จำนวนสมาชิกแยกตามภาค</p>
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
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            <Bar dataKey="alcohol" name="งดเหล้า" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="tobacco" name="งดบุหรี่" fill="#374151" radius={[3, 3, 0, 0]} />
            <Bar dataKey="dnd" name="ดื่มไม่ขับ" fill="#0d9488" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
