'use client'

import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'

type VillageRow = {
  id: number
  name: string
  zone: string
  province: string
  personCount: number
  screenedCount: number
  score: number
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-yellow-400 text-gray-900'
              : score >= 40 ? 'bg-yellow-100 text-yellow-800'
              :               'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black ${color}`}>
      {score}
    </span>
  )
}

export default function VillageReadinessTable({ villages }: { villages: VillageRow[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">คะแนนความพร้อม</p>
          <p className="text-sm font-medium text-white mt-0.5">ลำดับหมู่บ้าน (คะแนนเต็ม 100)</p>
        </div>
        <Trophy className="w-5 h-5 text-yellow-400" />
      </div>
      <div className="divide-y divide-gray-50">
        {villages.map((v, i) => (
          <Link
            key={v.id}
            href={`/dashboard/villages/${v.id}`}
            className="flex items-center gap-4 px-5 py-3 hover:bg-yellow-50/40 transition-colors group"
          >
            <span className={`text-sm font-bold w-5 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-yellow-700' : 'text-gray-300'}`}>
              {i + 1}
            </span>
            <ScoreBadge score={v.score} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-yellow-700">
                บ้าน{v.name}
              </p>
              <p className="text-xs text-gray-400 truncate">จ.{v.province} · {v.zone}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">{v.personCount} สมาชิก</p>
              <p className="text-xs text-gray-400">{v.screenedCount} คัดกรอง</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-yellow-400 flex-shrink-0" />
          </Link>
        ))}
        {villages.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-gray-400">ยังไม่มีข้อมูลหมู่บ้าน</p>
        )}
      </div>
    </div>
  )
}
