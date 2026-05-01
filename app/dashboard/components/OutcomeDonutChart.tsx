'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

type DonutProps = {
  title: string
  success: number
  total: number
  color: string
}

function Donut({ title, success, total, color }: DonutProps) {
  const pct = total > 0 ? Math.round((success / total) * 100) : 0
  const data = [
    { name: 'มีผลดีขึ้น', value: success },
    { name: 'ยังไม่มีผล', value: Math.max(total - success, 0) },
  ]
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-medium text-gray-600">{title}</p>
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 10, border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: 'none' }}
              formatter={(v: unknown) => [`${v} คน`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">{success} / {total} คน</p>
      </div>
    </div>
  )
}

export default function OutcomeDonutChart({
  alcSuccess, alcTotal, tobSuccess, tobTotal,
}: {
  alcSuccess: number; alcTotal: number; tobSuccess: number; tobTotal: number
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผลสำเร็จ</p>
        <p className="text-sm font-medium text-white mt-0.5">อัตราสำเร็จปีที่ 1</p>
      </div>
      <div className="flex items-center justify-around px-4 py-6">
        <Donut title="งดเหล้า" success={alcSuccess} total={alcTotal} color="#f59e0b" />
        <div className="w-px h-24 bg-gray-100" />
        <Donut title="งดบุหรี่" success={tobSuccess} total={tobTotal} color="#374151" />
      </div>
    </div>
  )
}
