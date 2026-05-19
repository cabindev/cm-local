'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, BarChart2 } from 'lucide-react'
import EvaluationSummary from './EvaluationSummary'

type Person = {
  id: number
  name: string
  alcohol: { statusY1: string; statusY2: string | null; statusY3: string | null } | null
  tobacco: { smokeType: string; statusY1: string; statusY2: string | null; statusY3: string | null } | null
  dnd:     { drinkType: string; year1Result: string | null; year2Result: string | null; year3Result: string | null } | null
}

type Screening = { screenedCount: number } | null

export function EvaluationTrigger() {
  function handleClick() {
    const el = document.getElementById('evaluation-panel')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // fire custom event to open panel
    el.dispatchEvent(new CustomEvent('open-evaluation'))
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-yellow-400 text-xs font-semibold rounded-lg transition-colors"
    >
      <BarChart2 className="w-3.5 h-3.5" />
      ดูผลประเมิน
    </button>
  )
}

export default function EvaluationPanel({
  persons,
  screening,
  villageId,
}: {
  persons: Person[]
  screening: Screening
  villageId: number
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = document.getElementById('evaluation-panel')
    if (!el) return
    const handler = () => setOpen(true)
    el.addEventListener('open-evaluation', handler)
    return () => el.removeEventListener('open-evaluation', handler)
  }, [])

  const hasData = persons.some((p) => p.alcohol?.statusY2 || p.tobacco?.statusY2 || p.dnd?.year2Result)

  return (
    <div id="evaluation-panel" className="scroll-mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 hover:border-yellow-400 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">ผลการประเมิน 3 ปี</p>
            <p className="text-xs text-gray-400">
              {hasData ? 'มีข้อมูลการประเมิน — คลิกเพื่อดูรายละเอียด' : 'ยังไม่มีข้อมูลการประเมินปีที่ 2/3'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!open && hasData && (
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          )}
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-yellow-500" />}
        </div>
      </button>

      {open && (
        <div className="mt-3">
          <EvaluationSummary persons={persons} screening={screening} villageId={villageId} />
        </div>
      )}
    </div>
  )
}
