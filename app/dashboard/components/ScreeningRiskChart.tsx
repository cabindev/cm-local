'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

type Props = {
  alc: { riskLow: number; risk: number; danger: number; addicted: number; none: number }
  tob: { count: number; none: number }
  dnd: { drinkDrive: number; drinkNoDrive: number; none: number }
  screened: number
}

export default function ScreeningRiskChart({ alc, tob, dnd, screened }: Props) {
  if (screened === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผลคัดกรอง</p>
          <p className="text-sm font-medium text-white mt-0.5">สัดส่วนกลุ่มเสี่ยงรวมทุกหมู่บ้าน</p>
        </div>
        <div className="flex items-center justify-center h-32 text-sm text-gray-400">ยังไม่มีข้อมูลคัดกรอง</div>
      </div>
    )
  }

  const alcData = [
    { name: 'เสี่ยงต่ำ',   value: alc.riskLow,  fill: '#fef08a' },
    { name: 'เสี่ยง',      value: alc.risk,     fill: '#fbbf24' },
    { name: 'อันตราย',     value: alc.danger,   fill: '#f59e0b' },
    { name: 'ติด',         value: alc.addicted, fill: '#b45309' },
    { name: 'ไม่ดื่ม',     value: alc.none,     fill: '#d1fae5' },
  ].filter(d => d.value > 0)

  const summary = [
    {
      name: 'แอลกอฮอล์',
      'เสี่ยงต่ำ': alc.riskLow, 'เสี่ยง': alc.risk, 'อันตราย': alc.danger, 'ติด': alc.addicted, 'ไม่ดื่ม': alc.none,
    },
    { name: 'บุหรี่',     'สูบ': tob.count, 'ไม่สูบ': tob.none },
    { name: 'ดื่มแล้วขับ', 'ดื่มแล้วขับ': dnd.drinkDrive, 'ดื่มไม่ขับ': dnd.drinkNoDrive, 'ไม่ดื่ม': dnd.none },
  ]

  const alcTotal = alc.riskLow + alc.risk + alc.danger + alc.addicted
  const alcPct = screened > 0 ? Math.round((alcTotal / screened) * 100) : 0
  const tobPct = screened > 0 ? Math.round((tob.count / screened) * 100) : 0
  const dndPct = screened > 0 ? Math.round((dnd.drinkDrive / screened) * 100) : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผลคัดกรอง</p>
        <p className="text-sm font-medium text-white mt-0.5">สัดส่วนกลุ่มเสี่ยงรวมทุกหมู่บ้าน ({screened.toLocaleString()} คน)</p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 px-4 pt-4 pb-2">
        {[
          { label: 'ผู้ดื่มแอลกอฮอล์', pct: alcPct, count: alcTotal, color: 'text-yellow-600' },
          { label: 'ผู้สูบบุหรี่',     pct: tobPct, count: tob.count, color: 'text-yellow-800' },
          { label: 'ดื่มแล้วขับ',      pct: dndPct, count: dnd.drinkDrive, color: 'text-gray-700' },
        ].map(({ label, pct, count, color }) => (
          <div key={label} className="text-center px-2">
            <p className={`text-3xl font-black ${color}`}>{pct}<span className="text-base font-semibold">%</span></p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{count.toLocaleString()} คน</p>
          </div>
        ))}
      </div>

      {/* Alcohol risk breakdown */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-xs text-gray-400 mb-2">ระดับความเสี่ยงแอลกอฮอล์</p>
        <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
          {alcData.map((d) => {
            const w = screened > 0 ? (d.value / screened) * 100 : 0
            return w > 0 ? (
              <div key={d.name} style={{ width: `${w}%`, backgroundColor: d.fill }}
                title={`${d.name}: ${d.value} คน (${Math.round(w)}%)`}
                className="flex items-center justify-center text-[9px] font-bold text-gray-700 cursor-default"
              >
                {w > 5 ? `${Math.round(w)}%` : ''}
              </div>
            ) : null
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {alcData.map(d => (
            <span key={d.name} className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
              {d.name} {d.value.toLocaleString()}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
