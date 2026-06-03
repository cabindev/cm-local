'use client'

const ORG_LABELS: Record<string, string> = {
  school:       'สถานศึกษา',
  temple:       'วัด/ศาสนสถาน',
  localAdmin:   'ท้องถิ่น (อบต./เทศบาล)',
  villageAdmin: 'ท้องที่ (กำนัน/ผู้ใหญ่บ้าน)',
  hospital:     'รพ.สต.',
  orgGroup:     'กลุ่มองค์กร',
}

type Props = {
  orgParticipation: Record<string, number>
  total: number
}

export default function OrgParticipationChart({ orgParticipation, total }: Props) {
  const rows = Object.entries(ORG_LABELS)
    .map(([key, label]) => ({ key, label, count: orgParticipation[key] ?? 0 }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">การมีส่วนร่วม</p>
        <p className="text-xs text-gray-400 mt-0.5">หน่วยงานที่เข้าร่วมโครงการ</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        {rows.map(({ key, label, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{label}</span>
                <span className="text-sm font-normal text-gray-900 tabular-nums">
                  {count}
                  <span className="text-xs font-normal text-gray-400 ml-1">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: pct >= 50 ? '#facc15' : pct >= 25 ? '#fde68a' : '#fed7aa' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
