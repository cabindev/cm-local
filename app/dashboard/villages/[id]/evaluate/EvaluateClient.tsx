'use client'

import { useState, useCallback } from 'react'
import { updatePerson } from '@/app/actions/person'
import { Wine, Cigarette, Car, CheckCircle } from 'lucide-react'

const STATUS_Y1 = ['ตั้งใจเลิก', 'มีแนวโน้มที่จะเลิก', 'อยากลดแต่ยังมีอุปสรรค']
const STATUS_Y2 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ']
const STATUS_Y3 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดได้บางส่วน', 'ไม่บรรลุเป้าหมาย']
const DND_Y1 = ['ตั้งใจดื่มไม่ขับ', 'มีแนวโน้มจะเปลี่ยนพฤติกรรม', 'อยากเปลี่ยนแต่ยังมีอุปสรรค']
const DND_Y2 = ['บรรลุเป้าหมาย', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ']
const DND_Y3 = ['บรรลุเป้าหมายอย่างต่อเนื่อง', 'ลดพฤติกรรมได้บางส่วน', 'ยังคงพฤติกรรมเดิม', 'ไม่บรรลุเป้าหมาย']

type AlcoholData = {
  drinkType: string
  statusY1: string
  statusY2: string | null
  statusY3: string | null
}
type TobaccoData = {
  smokeType: string
  statusY1: string
  statusY2: string | null
  statusY3: string | null
}
type DndData = {
  drinkType: string
  year1Result: string | null
  year2Result: string | null
  year3Result: string | null
}

type Person = {
  id: number
  name: string
  alcohol: AlcoholData | null
  tobacco: TobaccoData | null
  dnd: DndData | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function isPersonComplete(p: Person): boolean {
  if (p.alcohol && (!p.alcohol.statusY2 || !p.alcohol.statusY3)) return false
  if (p.tobacco && (!p.tobacco.statusY2 || !p.tobacco.statusY3)) return false
  if (p.dnd && (!p.dnd.year2Result || !p.dnd.year3Result)) return false
  if (!p.alcohol && !p.tobacco && !p.dnd) return false
  return true
}

function YearSelect({
  value, opts, required = false, onChange, onBlur,
}: {
  value: string
  opts: readonly string[]
  required?: boolean
  onChange: (v: string) => void
  onBlur: () => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white"
    >
      {!required && <option value="">-- ยังไม่ระบุ --</option>}
      {opts.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}

function PersonRow({
  person,
  villageId,
  index,
}: {
  person: Person
  villageId: number
  index: number
}) {
  const [alcY1, setAlcY1] = useState(person.alcohol?.statusY1 ?? '')
  const [alcY2, setAlcY2] = useState(person.alcohol?.statusY2 ?? '')
  const [alcY3, setAlcY3] = useState(person.alcohol?.statusY3 ?? '')
  const [tobY1, setTobY1] = useState(person.tobacco?.statusY1 ?? '')
  const [tobY2, setTobY2] = useState(person.tobacco?.statusY2 ?? '')
  const [tobY3, setTobY3] = useState(person.tobacco?.statusY3 ?? '')
  const [dndY1, setDndY1] = useState(person.dnd?.year1Result || DND_Y1[0])
  const [dndY2, setDndY2] = useState(person.dnd?.year2Result ?? '')
  const [dndY3, setDndY3] = useState(person.dnd?.year3Result ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const complete = useCallback(() => {
    if (person.alcohol && (!alcY2 || !alcY3)) return false
    if (person.tobacco && (!tobY2 || !tobY3)) return false
    if (person.dnd && (!dndY2 || !dndY3)) return false
    if (!person.alcohol && !person.tobacco && !person.dnd) return false
    return true
  }, [person, alcY2, alcY3, tobY2, tobY3, dndY2, dndY3])

  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      await updatePerson(person.id, villageId, {
        ...(person.alcohol && {
          alcohol: {
            drinkType: person.alcohol.drinkType,
            statusY1: alcY1 || person.alcohol.statusY1,
            statusY2: alcY2 || undefined,
            statusY3: alcY3 || undefined,
          },
        }),
        ...(person.tobacco && {
          tobacco: {
            smokeType: person.tobacco.smokeType,
            statusY1: tobY1 || person.tobacco.statusY1,
            statusY2: tobY2 || undefined,
            statusY3: tobY3 || undefined,
          },
        }),
        ...(person.dnd && {
          dnd: {
            drinkType: person.dnd.drinkType,
            year1Result: dndY1 || undefined,
            year2Result: dndY2 || undefined,
            year3Result: dndY3 || undefined,
          },
        }),
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [person, villageId, alcY1, alcY2, alcY3, tobY1, tobY2, tobY3, dndY1, dndY2, dndY3])

  const isComplete = complete()

  return (
    <div className={`bg-white rounded-2xl border p-4 space-y-3 ${isComplete ? 'border-green-200' : 'border-red-300'}`}>
      {/* Person header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-yellow-400">{index}</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">{person.name}</span>
          {isComplete && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && <span className="text-xs text-gray-400 animate-pulse">กำลังบันทึก...</span>}
          {saveStatus === 'saved'  && <span className="text-xs text-green-600 font-semibold">บันทึกแล้ว ✓</span>}
          {saveStatus === 'error'  && <span className="text-xs text-red-500">เกิดข้อผิดพลาด</span>}
        </div>
      </div>

      {/* Alcohol */}
      {person.alcohol && (
        <div className="border border-amber-100 rounded-xl overflow-hidden">
          <div className="bg-amber-50 px-3 py-1.5 flex items-center gap-2 border-b border-amber-100">
            <Wine className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">เหล้า</span>
            <span className="text-xs text-amber-600">{person.alcohol.drinkType}</span>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {[
              { label: 'ปีที่ 1', val: alcY1, set: setAlcY1, opts: STATUS_Y1, required: true },
              { label: 'ปีที่ 2', val: alcY2, set: setAlcY2, opts: STATUS_Y2 },
              { label: 'ปีที่ 3', val: alcY3, set: setAlcY3, opts: STATUS_Y3 },
            ].map(({ label, val, set, opts, required }) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] font-semibold text-gray-500">{label}</p>
                <YearSelect value={val} opts={opts} required={required} onChange={set} onBlur={save} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tobacco */}
      {person.tobacco && (
        <div className="border border-blue-100 rounded-xl overflow-hidden">
          <div className="bg-blue-50 px-3 py-1.5 flex items-center gap-2 border-b border-blue-100">
            <Cigarette className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">บุหรี่</span>
            <span className="text-xs text-blue-600">{person.tobacco.smokeType}</span>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {[
              { label: 'ปีที่ 1', val: tobY1, set: setTobY1, opts: STATUS_Y1, required: true },
              { label: 'ปีที่ 2', val: tobY2, set: setTobY2, opts: STATUS_Y2 },
              { label: 'ปีที่ 3', val: tobY3, set: setTobY3, opts: STATUS_Y3 },
            ].map(({ label, val, set, opts, required }) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] font-semibold text-gray-500">{label}</p>
                <YearSelect value={val} opts={opts} required={required} onChange={set} onBlur={save} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DND */}
      {person.dnd && (
        <div className="border border-orange-100 rounded-xl overflow-hidden">
          <div className="bg-orange-50 px-3 py-1.5 flex items-center gap-2 border-b border-orange-100">
            <Car className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs font-semibold text-orange-800">ดื่มไม่ขับ</span>
            <span className="text-xs text-orange-600">{person.dnd.drinkType}</span>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {[
              { label: 'ปีที่ 1', val: dndY1, set: setDndY1, opts: DND_Y1, required: true },
              { label: 'ปีที่ 2', val: dndY2, set: setDndY2, opts: DND_Y2 },
              { label: 'ปีที่ 3', val: dndY3, set: setDndY3, opts: DND_Y3 },
            ].map(({ label, val, set, opts, required }) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] font-semibold text-gray-500">{label}</p>
                <YearSelect value={val} opts={opts} required={required} onChange={set} onBlur={save} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EvaluateClient({
  villageId,
  persons,
}: {
  villageId: number
  persons: Person[]
}) {
  const completeCount = persons.filter(isPersonComplete).length

  if (persons.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <p className="text-gray-400 text-sm">ยังไม่มีสมาชิกในหมู่บ้านนี้</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          ประเมินครบแล้ว <span className="font-bold text-gray-900">{completeCount}</span> / <span className="font-bold text-gray-900">{persons.length}</span> คน
        </p>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${persons.length > 0 ? (completeCount / persons.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {persons.length > 0 ? Math.round((completeCount / persons.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Person cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {persons.map((p) => (
          <PersonRow key={p.id} person={p} villageId={villageId} index={persons.indexOf(p) + 1} />
        ))}
      </div>
    </div>
  )
}
