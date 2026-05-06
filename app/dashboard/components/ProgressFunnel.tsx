'use client'

type YearBarProps = { year: number; count: number; total: number; color: string }

function YearBar({ year, count, total, color }: YearBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-gray-500">ปีที่ {year}</span>
        <span className="text-[11px] font-semibold text-gray-700">
          {count.toLocaleString()} คน
          <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 0.6s ease' }}
        />
      </div>
    </div>
  )
}

type GroupData = {
  label: string; total: number
  y1: number; y2: number; y3: number
  color: string; bg: string; border: string
}

function GroupCard({ g }: { g: GroupData }) {
  return (
    <div className={`rounded-xl border ${g.border} ${g.bg} p-4 space-y-3`}>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{g.label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none mt-1">
          {g.total.toLocaleString()}
          <span className="text-xs font-normal text-gray-400 ml-1">คนสมัครทั้งหมด</span>
        </p>
      </div>
      <div className="space-y-2.5 pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-400">มีผลบันทึกติดตาม</p>
        <YearBar year={1} count={g.y1} total={g.total} color={g.color} />
        <YearBar year={2} count={g.y2} total={g.total} color={g.color} />
        <YearBar year={3} count={g.y3} total={g.total} color={g.color} />
      </div>
    </div>
  )
}

type Props = {
  alcTotal: number; alcY1: number; alcY2: number; alcY3: number
  tobTotal: number; tobY1: number; tobY2: number; tobY3: number
  dndTotal: number; dndY1: number; dndY2: number; dndY3: number
}

export default function ProgressFunnel(p: Props) {
  const groups: GroupData[] = [
    { label: 'งดเหล้า',   total: p.alcTotal, y1: p.alcY1, y2: p.alcY2, y3: p.alcY3, color: '#eab308', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
    { label: 'งดบุหรี่',  total: p.tobTotal, y1: p.tobY1, y2: p.tobY2, y3: p.tobY3, color: '#ca8a04', bg: 'bg-yellow-50',  border: 'border-yellow-300' },
    { label: 'ดื่มไม่ขับ', total: p.dndTotal, y1: p.dndY1, y2: p.dndY2, y3: p.dndY3, color: '#111827', bg: 'bg-gray-50',   border: 'border-gray-200'   },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ผลติดตาม</p>
        <p className="text-sm font-medium text-white mt-0.5">ความคืบหน้าแยกตามปี</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
        {groups.map((g) => <GroupCard key={g.label} g={g} />)}
      </div>
    </div>
  )
}
