'use client'

import { useState } from 'react'
import {
  upsertScreening,
  upsertAlcoholParticipant,
  upsertAlcoholResult,
  upsertTobaccoParticipant,
  upsertTobaccoResult,
  upsertDrinkNotDrive,
  upsertCommunityStats,
} from '@/app/actions/health-data'
import type { getVillageById } from '@/app/actions/village'

type Village = NonNullable<Awaited<ReturnType<typeof getVillageById>>>
type SectionKey = 'screening' | 'alcPart' | 'alcResult' | 'tobPart' | 'tobResult' | 'dnd' | 'stats'

type Props = {
  villageId: number
  year: number
  data: {
    screening: Village['screeningResults'][0] | null
    alcoholParticipant: Village['alcoholParticipants'][0] | null
    alcoholResult: Village['alcoholResults'][0] | null
    tobaccoParticipant: Village['tobaccoParticipants'][0] | null
    tobaccoResult: Village['tobaccoResults'][0] | null
    drinkNotDrive: Village['drinkNotDrives'][0] | null
    communityStats: Village['communityStats'][0] | null
  }
}

const n = (v?: number | null) => v ?? 0

export default function YearForm({ villageId, year, data }: Props) {
  const [saving, setSaving] = useState<SectionKey | null>(null)
  const [saved,  setSaved]  = useState<SectionKey | null>(null)

  const flash = (k: SectionKey) => { setSaved(k); setTimeout(() => setSaved(null), 2000) }

  const [sc, setSc] = useState({
    screenedCount: n(data.screening?.screenedCount),
    alcoholRiskLow: n(data.screening?.alcoholRiskLow),
    alcoholRisk: n(data.screening?.alcoholRisk),
    alcoholDanger: n(data.screening?.alcoholDanger),
    alcoholAddicted: n(data.screening?.alcoholAddicted),
    alcoholNone: n(data.screening?.alcoholNone),
    tobaccoCount: n(data.screening?.tobaccoCount),
    tobaccoNone: n(data.screening?.tobaccoNone),
    drinkAndDrive: n(data.screening?.drinkAndDrive),
    drinkNotDriveN: n(data.screening?.drinkNotDriveN),
  })

  const [ap, setAp] = useState({
    targetCount: n(data.alcoholParticipant?.targetCount),
    participantCount: n(data.alcoholParticipant?.participantCount),
    quitCount: n(data.alcoholParticipant?.quitCount),
    reducedCount: n(data.alcoholParticipant?.reducedCount),
  })

  const [ar, setAr] = useState({
    month3Quit: n(data.alcoholResult?.month3Quit),
    month3Reduced: n(data.alcoholResult?.month3Reduced),
    month6Quit: n(data.alcoholResult?.month6Quit),
    month6Reduced: n(data.alcoholResult?.month6Reduced),
  })

  const [tp, setTp] = useState({
    targetCount: n(data.tobaccoParticipant?.targetCount),
    participantCount: n(data.tobaccoParticipant?.participantCount),
    quitCount: n(data.tobaccoParticipant?.quitCount),
    reducedCount: n(data.tobaccoParticipant?.reducedCount),
  })

  const [tr, setTr] = useState({
    month3Quit: n(data.tobaccoResult?.month3Quit),
    month3Reduced: n(data.tobaccoResult?.month3Reduced),
    month6Quit: n(data.tobaccoResult?.month6Quit),
    month6Reduced: n(data.tobaccoResult?.month6Reduced),
  })

  const [dnd, setDnd] = useState({
    pledgeCount: n(data.drinkNotDrive?.pledgeCount),
    checkpointCount: n(data.drinkNotDrive?.checkpointCount),
    violationCount: n(data.drinkNotDrive?.violationCount),
  })

  const [st, setSt] = useState({
    meetingCount: n(data.communityStats?.meetingCount),
    participantCount: n(data.communityStats?.participantCount),
    fundAmount: n(data.communityStats?.fundAmount),
    activityCount: n(data.communityStats?.activityCount),
  })

  const numRow = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    unit = 'คน'
  ) => (
    <tr key={label} className="border-b border-gray-50">
      <td className="py-2 pr-4 text-sm text-gray-600 whitespace-nowrap">{label}</td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-right"
          />
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </td>
    </tr>
  )

  const card = (
    key: SectionKey,
    badge: string,
    color: string,
    title: string,
    rows: React.ReactNode,
    onSave: () => Promise<void>
  ) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3 ${color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-full">{badge}</span>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <button
          onClick={async () => { setSaving(key); await onSave(); setSaving(null); flash(key) }}
          disabled={saving === key}
          className="px-3 py-1 bg-white/80 hover:bg-white text-gray-900 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {saving === key ? 'บันทึก...' : saved === key ? '✓ บันทึกแล้ว' : 'บันทึก'}
        </button>
      </div>
      <div className="px-5 py-3">
        <table className="w-full">{rows}</table>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {card('screening', '1', 'bg-blue-50 text-blue-800', 'ผลการคัดกรองประชากร',
        <tbody>
          {numRow('จำนวนคนคัดกรอง', sc.screenedCount, (v) => setSc((p) => ({ ...p, screenedCount: v })))}
          <tr><td colSpan={2} className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">ระดับการดื่มแอลกอฮอล์</td></tr>
          {numRow('ดื่มแบบเสี่ยงต่ำ', sc.alcoholRiskLow, (v) => setSc((p) => ({ ...p, alcoholRiskLow: v })))}
          {numRow('ดื่มแบบเสี่ยง', sc.alcoholRisk, (v) => setSc((p) => ({ ...p, alcoholRisk: v })))}
          {numRow('ดื่มแบบอันตราย', sc.alcoholDanger, (v) => setSc((p) => ({ ...p, alcoholDanger: v })))}
          {numRow('ดื่มแบบติด', sc.alcoholAddicted, (v) => setSc((p) => ({ ...p, alcoholAddicted: v })))}
          {numRow('ไม่ดื่ม', sc.alcoholNone, (v) => setSc((p) => ({ ...p, alcoholNone: v })))}
          <tr><td colSpan={2} className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">บุหรี่ / ดื่มแล้วขับ</td></tr>
          {numRow('สูบบุหรี่', sc.tobaccoCount, (v) => setSc((p) => ({ ...p, tobaccoCount: v })))}
          {numRow('ไม่สูบบุหรี่', sc.tobaccoNone, (v) => setSc((p) => ({ ...p, tobaccoNone: v })))}
          {numRow('ดื่มแล้วขับ', sc.drinkAndDrive, (v) => setSc((p) => ({ ...p, drinkAndDrive: v })))}
          {numRow('ดื่มไม่ขับ', sc.drinkNotDriveN, (v) => setSc((p) => ({ ...p, drinkNotDriveN: v })))}
        </tbody>,
        () => upsertScreening(villageId, year, sc).then(() => {})
      )}

      {card('alcPart', '2', 'bg-orange-50 text-orange-800', 'โครงการเลิกเหล้า — ผู้เข้าร่วม',
        <tbody>
          {numRow('เป้าหมาย', ap.targetCount, (v) => setAp((p) => ({ ...p, targetCount: v })))}
          {numRow('เข้าร่วม', ap.participantCount, (v) => setAp((p) => ({ ...p, participantCount: v })))}
          {numRow('เลิกได้', ap.quitCount, (v) => setAp((p) => ({ ...p, quitCount: v })))}
          {numRow('ลดได้', ap.reducedCount, (v) => setAp((p) => ({ ...p, reducedCount: v })))}
        </tbody>,
        () => upsertAlcoholParticipant(villageId, year, ap).then(() => {})
      )}

      {card('alcResult', '3', 'bg-orange-50 text-orange-800', 'ผลติดตาม 3/6 เดือน (เหล้า)',
        <tbody>
          {numRow('เลิกได้ 3 เดือน', ar.month3Quit, (v) => setAr((p) => ({ ...p, month3Quit: v })))}
          {numRow('ลดได้ 3 เดือน', ar.month3Reduced, (v) => setAr((p) => ({ ...p, month3Reduced: v })))}
          {numRow('เลิกได้ 6 เดือน', ar.month6Quit, (v) => setAr((p) => ({ ...p, month6Quit: v })))}
          {numRow('ลดได้ 6 เดือน', ar.month6Reduced, (v) => setAr((p) => ({ ...p, month6Reduced: v })))}
        </tbody>,
        () => upsertAlcoholResult(villageId, year, ar).then(() => {})
      )}

      {card('tobPart', '4', 'bg-slate-50 text-slate-700', 'โครงการเลิกบุหรี่ — ผู้เข้าร่วม',
        <tbody>
          {numRow('เป้าหมาย', tp.targetCount, (v) => setTp((p) => ({ ...p, targetCount: v })))}
          {numRow('เข้าร่วม', tp.participantCount, (v) => setTp((p) => ({ ...p, participantCount: v })))}
          {numRow('เลิกได้', tp.quitCount, (v) => setTp((p) => ({ ...p, quitCount: v })))}
          {numRow('ลดได้', tp.reducedCount, (v) => setTp((p) => ({ ...p, reducedCount: v })))}
        </tbody>,
        () => upsertTobaccoParticipant(villageId, year, tp).then(() => {})
      )}

      {card('tobResult', '5', 'bg-slate-50 text-slate-700', 'ผลติดตาม 3/6 เดือน (บุหรี่)',
        <tbody>
          {numRow('เลิกได้ 3 เดือน', tr.month3Quit, (v) => setTr((p) => ({ ...p, month3Quit: v })))}
          {numRow('ลดได้ 3 เดือน', tr.month3Reduced, (v) => setTr((p) => ({ ...p, month3Reduced: v })))}
          {numRow('เลิกได้ 6 เดือน', tr.month6Quit, (v) => setTr((p) => ({ ...p, month6Quit: v })))}
          {numRow('ลดได้ 6 เดือน', tr.month6Reduced, (v) => setTr((p) => ({ ...p, month6Reduced: v })))}
        </tbody>,
        () => upsertTobaccoResult(villageId, year, tr).then(() => {})
      )}

      {card('dnd', '6', 'bg-red-50 text-red-800', 'ไม่ดื่มไม่ขับ',
        <tbody>
          {numRow('ลงนามปฏิญาณ', dnd.pledgeCount, (v) => setDnd((p) => ({ ...p, pledgeCount: v })))}
          {numRow('ด่านตรวจ', dnd.checkpointCount, (v) => setDnd((p) => ({ ...p, checkpointCount: v })), 'จุด')}
          {numRow('พบผู้ฝ่าฝืน', dnd.violationCount, (v) => setDnd((p) => ({ ...p, violationCount: v })))}
        </tbody>,
        () => upsertDrinkNotDrive(villageId, year, dnd).then(() => {})
      )}

      {card('stats', '7', 'bg-purple-50 text-purple-800', 'สถิติการมีส่วนร่วม',
        <tbody>
          {numRow('ครั้งที่ประชุม', st.meetingCount, (v) => setSt((p) => ({ ...p, meetingCount: v })), 'ครั้ง')}
          {numRow('ผู้เข้าร่วม', st.participantCount, (v) => setSt((p) => ({ ...p, participantCount: v })))}
          {numRow('กองทุน', st.fundAmount, (v) => setSt((p) => ({ ...p, fundAmount: v })), 'บาท')}
          {numRow('กิจกรรม', st.activityCount, (v) => setSt((p) => ({ ...p, activityCount: v })), 'กิจกรรม')}
        </tbody>,
        () => upsertCommunityStats(villageId, year, st).then(() => {})
      )}
    </div>
  )
}
