'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TrendingDown, CheckCircle2, XCircle, Clock, Target, AlertCircle, UserCheck, Info, X } from 'lucide-react'

function CriteriaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900 text-sm">เกณฑ์การประเมิน 3 ปี</p>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3 text-xs text-gray-700">

          {/* Year structure */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <p className="font-semibold text-gray-800">โครงสร้าง 3 ปี</p>
            <p><span className="font-medium text-gray-900">ปีที่ 1</span> — วัดเจตนา / การเข้าร่วม</p>
            <p><span className="font-medium text-gray-900">ปีที่ 2</span> — วัดการลดพฤติกรรม</p>
            <p><span className="font-medium text-gray-900">ปีที่ 3</span> — วัดผลสำเร็จสุดท้าย <span className="text-gray-500">(ใช้คำนวณ KPI)</span></p>
          </div>

          {/* KPI by group */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-800">KPI เป้าหมาย (คำนวณจากปีที่ 3)</p>

            {/* เหล้า */}
            <div className="border border-amber-100 rounded-xl overflow-hidden">
              <div className="bg-amber-50 px-3 py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />กลุ่มเหล้า
                </span>
                <span className="text-xs font-bold text-amber-600">เป้า 10%</span>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-amber-50 bg-gray-50">
                  <th className="text-left px-3 py-1 font-medium text-gray-500 w-1/2">ผลปีที่ 3</th>
                  <th className="text-center px-3 py-1 font-medium text-gray-500">นับ</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['เลิกได้แล้ว', true],
                    ['ลดพฤติกรรมได้อย่างต่อเนื่อง', true],
                    ['ลดได้บางส่วน', false],
                    ['ไม่บรรลุเป้าหมาย', false],
                  ].map(([label, ok]) => (
                    <tr key={label as string}>
                      <td className="px-3 py-1.5 text-gray-700">{label as string}</td>
                      <td className="px-3 py-1.5 text-center">
                        {ok ? <span className="text-green-600 font-bold">✓ สำเร็จ</span> : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* บุหรี่ */}
            <div className="border border-blue-100 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-3 py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />กลุ่มบุหรี่
                </span>
                <span className="text-xs font-bold text-blue-600">เป้า 15%</span>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-blue-50 bg-gray-50">
                  <th className="text-left px-3 py-1 font-medium text-gray-500 w-1/2">ผลปีที่ 3</th>
                  <th className="text-center px-3 py-1 font-medium text-gray-500">นับ</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['เลิกได้แล้ว', true],
                    ['ลดพฤติกรรมได้อย่างต่อเนื่อง', true],
                    ['ลดได้บางส่วน', false],
                    ['ไม่บรรลุเป้าหมาย', false],
                  ].map(([label, ok]) => (
                    <tr key={label as string}>
                      <td className="px-3 py-1.5 text-gray-700">{label as string}</td>
                      <td className="px-3 py-1.5 text-center">
                        {ok ? <span className="text-green-600 font-bold">✓ สำเร็จ</span> : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ดื่มไม่ขับ */}
            <div className="border border-orange-100 rounded-xl overflow-hidden">
              <div className="bg-orange-50 px-3 py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-800">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />กลุ่มดื่มไม่ขับ
                </span>
                <span className="text-xs font-bold text-orange-600">เป้า 10%</span>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-orange-50 bg-gray-50">
                  <th className="text-left px-3 py-1 font-medium text-gray-500 w-1/2">ผลปีที่ 3</th>
                  <th className="text-center px-3 py-1 font-medium text-gray-500">นับ</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['บรรลุเป้าหมายอย่างต่อเนื่อง', true],
                    ['ลดพฤติกรรมได้บางส่วน', false],
                    ['ยังคงพฤติกรรมเดิม', false],
                    ['ไม่บรรลุเป้าหมาย', false],
                  ].map(([label, ok]) => (
                    <tr key={label as string}>
                      <td className="px-3 py-1.5 text-gray-700">{label as string}</td>
                      <td className="px-3 py-1.5 text-center">
                        {ok ? <span className="text-green-600 font-bold">✓ สำเร็จ</span> : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="font-semibold text-yellow-800 mb-1">สูตรคำนวณ</p>
            <p className="text-yellow-700">จำนวนสำเร็จ ÷ จำนวนที่ประเมินแล้ว × 100</p>
            <p className="text-yellow-600 mt-1">* บรรลุ KPI เมื่อประเมินครบทุกคน และผล ≥ เป้า</p>
          </div>
        </div>
      </div>
    </div>
  )
}

type Person = {
  id: number
  name: string
  alcohol: { statusY1: string; statusY2: string | null; statusY3: string | null } | null
  tobacco: { smokeType: string; statusY1: string; statusY2: string | null; statusY3: string | null } | null
  dnd:     { drinkType: string; year1Result: string | null; year2Result: string | null; year3Result: string | null } | null
}

type Screening = { screenedCount: number } | null

function categorize(s: string | null | undefined) {
  if (!s) return 'pending'
  if (s === 'เลิกได้แล้ว') return 'quit'
  if (s === 'ลดพฤติกรรมได้อย่างต่อเนื่อง' || s === 'ลดพฤติกรรมได้') return 'reduced'
  if (s === 'ลดได้บางส่วน') return 'partial'
  if (s === 'ยังคงพฤติกรรมเดิม') return 'unchanged'
  if (s === 'ออกจากโครงการ' || s === 'ไม่บรรลุเป้าหมาย') return 'dropout'
  return 'pending'
}

const CAT = {
  quit:      { label: 'เลิกได้แล้ว',       dot: 'bg-green-500',  text: 'text-green-700'  },
  reduced:   { label: 'ลดพฤติกรรมได้',     dot: 'bg-blue-500',   text: 'text-blue-700'   },
  partial:   { label: 'ลดได้บางส่วน',      dot: 'bg-sky-400',    text: 'text-sky-700'    },
  unchanged: { label: 'พฤติกรรมเดิม',      dot: 'bg-orange-400', text: 'text-orange-700' },
  dropout:   { label: 'ไม่บรรลุเป้าหมาย',  dot: 'bg-red-500',    text: 'text-red-700'    },
  pending:   { label: 'ยังไม่ประเมิน',     dot: 'bg-gray-300',   text: 'text-gray-500'   },
}

type Cat = keyof typeof CAT

function GroupSection({
  label, colorDot, members, kpiTarget, villageId, pendingNames, pendingY2Names,
}: {
  label: string
  colorDot: string
  members: { name: string; id: number; statusY3: string | null }[]
  kpiTarget: number
  villageId: number
  pendingNames: { id: number; name: string }[]
  pendingY2Names: { id: number; name: string }[]
}) {
  const total         = members.length
  const assessed      = members.filter((m) => m.statusY3).length
  const pending       = total - assessed
  const allAssessed   = pending === 0
  const cats          = members.map((m) => categorize(m.statusY3) as Cat)
  const counts        = Object.fromEntries(
    (['quit','reduced','partial','unchanged','dropout','pending'] as Cat[]).map((c) => [c, cats.filter((x) => x === c).length])
  ) as Record<Cat, number>
  const achieveCount  = counts.quit + counts.reduced
  const achievePct    = assessed > 0 ? Math.round((achieveCount / assessed) * 100) : 0
  const kpiMet        = allAssessed && achievePct >= kpiTarget

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorDot}`} />
          <span className="text-sm font-bold text-gray-800">{label}</span>
          <span className="text-xs text-gray-400">{total} คน</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* จำนวนประเมินแล้ว */}
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
            ${allAssessed ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
            <UserCheck className="w-3 h-3" />
            ประเมินแล้ว {assessed}/{total}
            {!allAssessed && ` · ขาดอีก ${pending} คน`}
          </span>
          {/* KPI */}
          {allAssessed ? (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
              ${kpiMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <Target className="w-3 h-3" />
              {achievePct}% {kpiMet ? '✓ บรรลุ KPI' : `ต่ำกว่าเป้า ${kpiTarget}%`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              <Target className="w-3 h-3" />
              รอประเมินครบก่อนสรุป KPI
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100">
        {(['quit','reduced','partial','unchanged','dropout','pending'] as Cat[]).map((cat) => {
          const w = total > 0 ? (counts[cat] / total) * 100 : 0
          if (w === 0) return null
          return <div key={cat} style={{ width: `${w}%` }} className={`${CAT[cat].dot}`}
            title={`${CAT[cat].label}: ${counts[cat]} คน`} />
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {(['quit','reduced','partial','unchanged','dropout','pending'] as Cat[]).map((cat) => {
          if (counts[cat] === 0) return null
          return (
            <span key={cat} className="inline-flex items-center gap-1 text-xs text-gray-600">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT[cat].dot}`} />
              {CAT[cat].label}
              <span className={`font-bold ${CAT[cat].text}`}>{counts[cat]}</span>
            </span>
          )
        })}
      </div>

      {/* ขาดปีที่ 2 */}
      {pendingY2Names.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700">
            <AlertCircle className="w-3.5 h-3.5" />
            ยังไม่ประเมินปีที่ 2 — {pendingY2Names.length} คน
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingY2Names.map((pn) => (
              <Link
                key={pn.id}
                href={`/dashboard/villages/${villageId}/persons/${pn.id}/edit`}
                className="inline-flex items-center gap-1 text-xs bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-400 hover:text-gray-900 hover:border-yellow-400 px-2.5 py-1 rounded-lg transition-colors font-medium"
              >
                {pn.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ขาดปีที่ 3 */}
      {pendingNames.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
            <AlertCircle className="w-3.5 h-3.5" />
            ยังไม่ประเมินปีที่ 3 — {pendingNames.length} คน — กดประเมินได้เลย
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingNames.map((pn) => (
              <Link
                key={pn.id}
                href={`/dashboard/villages/${villageId}/persons/${pn.id}/edit`}
                className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 hover:bg-orange-400 hover:text-white hover:border-orange-400 px-2.5 py-1 rounded-lg transition-colors font-medium"
              >
                {pn.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EvaluationSummary({
  persons, villageId,
}: {
  persons: Person[]
  villageId: number
  screening: Screening
}) {
  const [showCriteria, setShowCriteria] = useState(false)
  const alcPersons = persons.filter((p) => p.alcohol)
  const tobPersons = persons.filter((p) => p.tobacco)
  const dndPersons = persons.filter((p) => p.dnd)

  if (alcPersons.length === 0 && tobPersons.length === 0 && dndPersons.length === 0) return null

  // รายชื่อที่ยังค้าง
  const alcPending   = alcPersons.filter((p) => !p.alcohol?.statusY3).map((p) => ({ id: p.id, name: p.name }))
  const alcPendingY2 = alcPersons.filter((p) => !p.alcohol?.statusY2).map((p) => ({ id: p.id, name: p.name }))
  const tobPending   = tobPersons.filter((p) => !p.tobacco?.statusY3).map((p) => ({ id: p.id, name: p.name }))
  const tobPendingY2 = tobPersons.filter((p) => !p.tobacco?.statusY2).map((p) => ({ id: p.id, name: p.name }))
  const dndPending   = dndPersons.filter((p) => !p.dnd?.year3Result?.trim()).map((p) => ({ id: p.id, name: p.name }))
  const dndPendingY2 = dndPersons.filter((p) => !p.dnd?.year2Result?.trim()).map((p) => ({ id: p.id, name: p.name }))

  // DND members
  const dndTotal      = dndPersons.length
  const dndAssessed   = dndPersons.filter((p) => p.dnd?.year3Result?.trim()).length
  const dndSuccess    = dndPersons.filter((p) => p.dnd?.year3Result === 'บรรลุเป้าหมายอย่างต่อเนื่อง').length
  const dndAllDone    = dndPending.length === 0
  const dndAchievePct = dndAssessed > 0 ? Math.round((dndSuccess / dndAssessed) * 100) : 0
  const dndKpiMet     = dndAllDone && dndAchievePct >= 10

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {showCriteria && <CriteriaModal onClose={() => setShowCriteria(false)} />}
      <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-sm">ผลการประเมิน 3 ปี</p>
          <p className="text-xs text-gray-400 mt-0.5">เทียบตัวชี้วัดโครงการ — ฐานข้อมูลปี 2569</p>
        </div>
        <button
          onClick={() => setShowCriteria(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          เกณฑ์
        </button>
      </div>

      <div className="p-5 space-y-6 divide-y divide-gray-50">

        {alcPersons.length > 0 && (
          <div className="pt-0">
            <GroupSection
              label="กลุ่มเหล้า" colorDot="bg-amber-400"
              members={alcPersons.map((p) => ({ id: p.id, name: p.name, statusY3: p.alcohol?.statusY3 ?? null }))}
              kpiTarget={10} villageId={villageId}
              pendingNames={alcPending}
              pendingY2Names={alcPendingY2}
            />
          </div>
        )}

        {tobPersons.length > 0 && (
          <div className="pt-5">
            <GroupSection
              label="กลุ่มบุหรี่" colorDot="bg-blue-400"
              members={tobPersons.map((p) => ({ id: p.id, name: p.name, statusY3: p.tobacco?.statusY3 ?? null }))}
              kpiTarget={15} villageId={villageId}
              pendingNames={tobPending}
              pendingY2Names={tobPendingY2}
            />
          </div>
        )}

        {dndPersons.length > 0 && (
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-sm font-bold text-gray-800">กลุ่มดื่มไม่ขับ</span>
                <span className="text-xs text-gray-400">{dndTotal} คน</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                  ${dndAllDone ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  <UserCheck className="w-3 h-3" />
                  ประเมินแล้ว {dndAssessed}/{dndTotal}
                  {!dndAllDone && ` · ขาดอีก ${dndPending.length} คน`}
                </span>
                {dndAllDone ? (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                    ${dndKpiMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    <Target className="w-3 h-3" />
                    {dndAchievePct}% {dndKpiMet ? '✓ บรรลุ KPI' : 'ต่ำกว่าเป้า 10%'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    <Target className="w-3 h-3" />
                    รอประเมินครบก่อนสรุป KPI
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100">
              {dndSuccess > 0 && <div style={{ width: `${(dndSuccess / dndTotal) * 100}%` }} className="bg-green-500" />}
              {(dndAssessed - dndSuccess) > 0 && <div style={{ width: `${((dndAssessed - dndSuccess) / dndTotal) * 100}%` }} className="bg-red-400" />}
              {dndPending.length > 0 && <div style={{ width: `${(dndPending.length / dndTotal) * 100}%` }} className="bg-gray-300" />}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {dndSuccess > 0 && <span className="inline-flex items-center gap-1 text-xs text-gray-600"><span className="w-2 h-2 rounded-full bg-green-500" />บรรลุเป้าหมาย <span className="font-bold text-green-700">{dndSuccess}</span></span>}
              {(dndAssessed - dndSuccess) > 0 && <span className="inline-flex items-center gap-1 text-xs text-gray-600"><span className="w-2 h-2 rounded-full bg-red-400" />ยังไม่บรรลุ <span className="font-bold text-red-700">{dndAssessed - dndSuccess}</span></span>}
              {dndPending.length > 0 && <span className="inline-flex items-center gap-1 text-xs text-gray-600"><span className="w-2 h-2 rounded-full bg-gray-300" />ยังไม่ประเมิน <span className="font-bold text-gray-600">{dndPending.length}</span></span>}
            </div>

            {dndPendingY2.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  ยังไม่ประเมินปีที่ 2 — {dndPendingY2.length} คน
                </div>
                <div className="flex flex-wrap gap-2">
                  {dndPendingY2.map((pn) => (
                    <Link key={pn.id} href={`/dashboard/villages/${villageId}/persons/${pn.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-400 hover:text-gray-900 hover:border-yellow-400 px-2.5 py-1 rounded-lg transition-colors font-medium">
                      {pn.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {dndPending.length > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  ยังไม่ประเมินปีที่ 3 — {dndPending.length} คน — กดประเมินได้เลย
                </div>
                <div className="flex flex-wrap gap-2">
                  {dndPending.map((pn) => (
                    <Link key={pn.id} href={`/dashboard/villages/${villageId}/persons/${pn.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 hover:bg-orange-400 hover:text-white hover:border-orange-400 px-2.5 py-1 rounded-lg transition-colors font-medium">
                      {pn.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
