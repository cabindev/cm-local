'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPerson } from '@/app/actions/person'
import { Wine, Cigarette, Car, Plus, X } from 'lucide-react'

const DRINK_TYPES    = ['เสี่ยงต่ำ', 'เสี่ยงสูง', 'อันตราย', 'ติดสุรา']
const SMOKE_TYPES    = ['สูบประจำ', 'นานๆ ครั้ง']
const SMOKE_QTY      = ['5-10 มวน', '11-20 มวน', 'มากกว่า 20 มวน']
const DND_TYPES      = ['เคยดื่มแล้วขับ 1 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 2 ครั้งต่อเดือน', 'เคยดื่มแล้วขับ 3 ครั้งต่อเดือน', 'ไม่เคยดื่มแล้วขับ']
// ปีที่ 1 — วัดเจตนา/การเข้าร่วม (ตัวชี้วัด: ≥20% ของผู้ถูกคัดกรอง)
const STATUS_Y1 = ['ตั้งใจเลิก', 'มีแนวโน้มที่จะเลิก', 'อยากลดแต่ยังมีอุปสรรค']
// ปีที่ 2 — วัดผลการลดพฤติกรรม (ตัวชี้วัด: เหล้า ≥10%, บุหรี่ ≥10%)
const STATUS_Y2 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ', 'เสียชีวิต']
// ปีที่ 3 — วัดผลสำเร็จเทียบฐานข้อมูลปี 2569
const STATUS_Y3 = ['เลิกได้แล้ว', 'ลดพฤติกรรมได้อย่างต่อเนื่อง', 'ลดได้บางส่วน', 'ไม่บรรลุเป้าหมาย', 'เสียชีวิต']
const DND_Y1 = ['ตั้งใจดื่มไม่ขับ', 'มีแนวโน้มจะเปลี่ยนพฤติกรรม', 'อยากเปลี่ยนแต่ยังมีอุปสรรค']
const DND_Y2 = ['บรรลุเป้าหมาย', 'ลดพฤติกรรมได้', 'ยังคงพฤติกรรมเดิม', 'ออกจากโครงการ', 'เสียชีวิต']
const DND_Y3 = ['บรรลุเป้าหมายอย่างต่อเนื่อง', 'ลดพฤติกรรมได้บางส่วน', 'ยังคงพฤติกรรมเดิม', 'ไม่บรรลุเป้าหมาย', 'เสียชีวิต']

const OUTCOMES = [
  { key: 'Money',    label: 'จำนวนเงินประหยัด/เดือน' },
  { key: 'Property', label: 'ทรัพย์สิน' },
  { key: 'Family',   label: 'ความสุขในครอบครัว' },
  { key: 'Health',   label: 'สุขภาพ' },
  { key: 'Work',     label: 'การทำงาน/อาชีพ' },
  { key: 'Accepted', label: 'ได้รับการยอมรับ' },
  { key: 'Other',    label: 'อื่นๆ' },
]

const MONEY_RANGES = [
  'น้อยกว่า 1,000 บาท',
  '1,000-2,000 บาท',
  '2,001-4,000 บาท',
  '4,001-6,000 บาท',
  '6,001-10,000 บาท',
  'มากกว่า 10,000 บาท',
]

type Outcomes = Record<string, boolean | string>

function parseItems(v: string | boolean | undefined): string[] {
  if (!v || typeof v === 'boolean') return []
  try {
    const p = JSON.parse(v as string)
    return Array.isArray(p) ? p : [v as string]
  } catch {
    return [v as string]
  }
}

function OutcomeItemList({ raw, onChange }: {
  raw: string | boolean | undefined
  onChange: (val: string) => void
}) {
  const items = parseItems(raw)
  const update = (next: string[]) => onChange(next.length ? JSON.stringify(next) : '')
  return (
    <div className="space-y-1 w-full">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            type="text"
            value={item}
            onChange={(e) => { const n = [...items]; n[i] = e.target.value; update(n) }}
            placeholder="ระบุ..."
            className="flex-1 px-2 py-1 border border-yellow-300 bg-yellow-50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <button type="button" onClick={() => update(items.filter((_, idx) => idx !== i))}
            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => update([...items, ''])}
        className="flex items-center gap-0.5 text-xs text-yellow-600 hover:text-yellow-700 font-medium">
        <Plus className="w-3 h-3" />เพิ่ม
      </button>
    </div>
  )
}

function OutcomeYearGrid({ values, onChange }: {
  values: Outcomes
  onChange: (key: string, val: boolean | string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-gray-400 font-medium w-32">ผลลัพธ์</th>
            {[1, 2, 3].map((y) => (
              <th key={y} className="text-center py-2 px-2 text-gray-400 font-medium">ปีที่ {y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {OUTCOMES.map(({ key, label }) => (
            <tr key={key} className="border-t border-gray-50">
              <td className="py-2 pr-3 text-gray-600">{label}</td>
              {[1, 2, 3].map((y) => {
                const boolKey = `y${y}${key}`
                const textKey = `y${y}${key}Text`
                const checked  = !!values[boolKey]
                return (
                  <td key={y} className="py-2 px-2 align-top">
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(boolKey, e.target.checked)}
                        className="accent-yellow-400 w-4 h-4"
                      />
                      {checked && key === 'Money' ? (
                        <>
                          <select
                            value={(values[textKey] as string) ?? ''}
                            onChange={(e) => onChange(textKey, e.target.value)}
                            className="w-full px-2 py-1 border border-yellow-300 bg-yellow-50 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          >
                            <option value="">-- เลือก --</option>
                            {MONEY_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <input
                            type="text"
                            value={(values[`y${y}${key}Note`] as string) ?? ''}
                            onChange={(e) => onChange(`y${y}${key}Note`, e.target.value)}
                            placeholder="เพิ่มข้อความ..."
                            className="w-full px-2 py-1 border border-yellow-200 bg-yellow-50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          />
                        </>
                      ) : checked ? (
                        <OutcomeItemList
                          raw={values[textKey]}
                          onChange={(val) => onChange(textKey, val)}
                        />
                      ) : null}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const YEAR_LABELS = [
  { label: 'ปีที่ 1', hint: 'วัดเจตนา/การเข้าร่วม' },
  { label: 'ปีที่ 2', hint: 'วัดการลดพฤติกรรม' },
  { label: 'ปีที่ 3', hint: 'วัดผลสำเร็จสุดท้าย' },
]

function StatusYearCard({ y1, setY1, y2, setY2, y3, setY3,
  optsY1 = STATUS_Y1, optsY2 = STATUS_Y2, optsY3 = STATUS_Y3, title = 'สถานะรายปี',
}: {
  y1: string; setY1: (v: string) => void
  y2: string; setY2: (v: string) => void
  y3: string; setY3: (v: string) => void
  optsY1?: readonly string[]
  optsY2?: readonly string[]
  optsY3?: readonly string[]
  title?: string
}) {
  const rows = [
    { val: y1, set: setY1, opts: optsY1, required: true  },
    { val: y2, set: setY2, opts: optsY2, required: false },
    { val: y3, set: setY3, opts: optsY3, required: false },
  ]
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
        <span className="text-xs text-gray-400 font-medium">{title} <span className="text-gray-500">(ประเมิน)</span></span>
      </div>
      {rows.map(({ val, set, opts, required }, i) => (
        <div key={i} className="border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <span className="text-xs font-semibold text-gray-700 w-10 flex-shrink-0">{YEAR_LABELS[i].label}</span>
            <span className="text-[10px] text-gray-400 flex-1">{YEAR_LABELS[i].hint}</span>
          </div>
          <div className="px-3 pb-2">
            <select
              value={val}
              onChange={(e) => {
                set(e.target.value)
                if (i === 1 && e.target.value === 'เสียชีวิต') setY3('เสียชีวิต')
              }}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white">
              {!required && <option value="">-- ยังไม่ระบุ --</option>}
              {opts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

type TabKey = 'info' | 'alcohol' | 'tobacco' | 'dnd'

function TabBar({ active, setActive, hasAlcohol, hasTobacco, hasDnd, alcIncomplete, tobIncomplete, dndIncomplete }: {
  active: TabKey
  setActive: (t: TabKey) => void
  hasAlcohol: boolean
  hasTobacco: boolean
  hasDnd: boolean
  alcIncomplete: boolean
  tobIncomplete: boolean
  dndIncomplete: boolean
}) {
  const tabs: { key: TabKey; label: string; emoji: string; has: boolean; incomplete: boolean }[] = [
    { key: 'info',    label: 'ข้อมูล',     emoji: '👤', has: true,       incomplete: false },
    { key: 'alcohol', label: 'เหล้า',      emoji: '🍺', has: hasAlcohol, incomplete: alcIncomplete },
    { key: 'tobacco', label: 'บุหรี่',     emoji: '🚬', has: hasTobacco, incomplete: tobIncomplete },
    { key: 'dnd',     label: 'ดื่มไม่ขับ', emoji: '🚗', has: hasDnd,     incomplete: dndIncomplete },
  ]
  return (
    <div className="flex border-b border-gray-200 bg-white rounded-t-2xl overflow-hidden">
      {tabs.map(({ key, label, emoji, has, incomplete }) => (
        <button
          key={key}
          type="button"
          onClick={() => setActive(key)}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-3 text-xs font-semibold transition-colors ${
            active === key
              ? 'text-gray-900 border-b-2 border-yellow-400 bg-yellow-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>{emoji}</span>
          <span className="hidden sm:inline">{label}</span>
          {key !== 'info' && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              has && incomplete ? 'bg-red-400' :
              has ? 'bg-green-400' : 'bg-gray-200'
            }`} />
          )}
        </button>
      ))}
    </div>
  )
}

export default function PersonForm({ villageId }: { villageId: number }) {
  const router     = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [name, setName]   = useState('')
  const [gender, setGender] = useState('')

  const [hasAlcohol, setHasAlcohol] = useState(false)
  const [drinkType, setDrinkType]   = useState('เสี่ยงต่ำ')
  const [alcStatus, setAlcStatus]   = useState('ตั้งใจเลิก')
  const [alcStatus2, setAlcStatus2] = useState('')
  const [alcStatus3, setAlcStatus3] = useState('')
  const [alcOutcomes, setAlcOutcomes] = useState<Outcomes>({})

  const [hasTobacco, setHasTobacco] = useState(false)
  const [smokeType, setSmokeType]   = useState('สูบประจำ')
  const [tobStatus, setTobStatus]   = useState('ตั้งใจเลิก')
  const [tobStatus2, setTobStatus2] = useState('')
  const [tobStatus3, setTobStatus3] = useState('')
  const [tobOutcomes, setTobOutcomes] = useState<Outcomes>({})
  // สูบประจำ sub-option
  const [smokeQty, setSmokeQty] = useState('')
  // นานๆ ครั้ง sub-options
  const [smokeSocial, setSmokeSocial] = useState(false)
  const [smokeSocialText, setSmokeSocialText] = useState('')
  const [smokeStress, setSmokeStress] = useState(false)
  const [smokeStressText, setSmokeStressText] = useState('')

  const [hasDnd, setHasDnd]   = useState(false)
  const [dndType, setDndType] = useState('เสี่ยงต่ำ')
  const [dndY1, setDndY1]     = useState(DND_Y1[0])
  const [dndY2, setDndY2]     = useState('')
  const [dndY3, setDndY3]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('กรุณาใส่ชื่อ-นามสกุล'); return }
    if (!gender) { setError('กรุณาเลือกเพศ'); return }
    if (!hasAlcohol && !hasTobacco && !hasDnd) {
      setError('กรุณาเลือกอย่างน้อย 1 หมวด (เหล้า / บุหรี่ / ไม่รับ)')
      return
    }
    startTransition(async () => {
      try {
        await createPerson({
          villageId,
          name: name.trim(),
          gender,
          ...(hasAlcohol && { alcohol: { drinkType, statusY1: alcStatus, statusY2: alcStatus2 || undefined, statusY3: alcStatus3 || undefined, outcomes: alcOutcomes } }),
          ...(hasTobacco && {
            tobacco: {
              smokeType: smokeType === 'สูบประจำ' && smokeQty ? `สูบประจำ ${smokeQty}` : smokeType,
              statusY1: tobStatus, statusY2: tobStatus2 || undefined, statusY3: tobStatus3 || undefined,
              noteY1: smokeType === 'นานๆ ครั้ง'
                ? [
                    smokeSocial ? `เวลาสังสรรค์${smokeSocialText ? ': ' + smokeSocialText : ''}` : '',
                    smokeStress ? `เวลาเครียด${smokeStressText ? ': ' + smokeStressText : ''}` : '',
                  ].filter(Boolean).join('\n') || undefined
                : undefined,
              outcomes: tobOutcomes,
            },
          }),
          ...(hasDnd && {
            dnd: {
              drinkType: dndType,
              year1Result: dndY1 || undefined,
              year2Result: dndY2 || undefined,
              year3Result: dndY3 || undefined,
            },
          }),
        })
        router.push(`/dashboard/villages/${villageId}`)
      } catch {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      }
    })
  }

  const selectCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── ข้อมูลพื้นฐาน ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ นามสกุล"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              เพศ <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
              {['ชาย', 'หญิง', 'LGBTQ'].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={(e) => setGender(e.target.value)}
                    className="accent-yellow-400 w-4 h-4"
                  />
                  <span className={`text-sm ${gender === g ? 'font-bold text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {g}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── เหล้า ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-amber-50 text-amber-900 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Wine className="w-4 h-4" />
            <p className="font-bold text-sm">ผู้ดื่ม — ผู้สมัครร่วมโครงการเลิกเหล้า</p>
          </div>
          <p className="text-xs opacity-60 mt-0.5 ml-6">กรอกเมื่อบุคคลนี้ดื่มเครื่องดื่มแอลกอฮอล์</p>
        </div>
        <div className="p-5 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={hasAlcohol}
              onChange={(e) => setHasAlcohol(e.target.checked)}
              className="accent-yellow-400 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">บุคคลนี้ดื่มเครื่องดื่มแอลกอฮอล์</span>
          </label>
          <div className={`space-y-4 transition-opacity duration-200 ${hasAlcohol ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">ประเภทการดื่ม</label>
                <select value={drinkType} onChange={(e) => setDrinkType(e.target.value)} className={selectCls}>
                  {DRINK_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <StatusYearCard
                y1={alcStatus}  setY1={setAlcStatus}
                y2={alcStatus2} setY2={(v) => {
                  setAlcStatus2(v)
                  if (v === 'เสียชีวิต') {
                    if (hasTobacco) { setTobStatus2('เสียชีวิต'); setTobStatus3('เสียชีวิต') }
                    if (hasDnd)     { setDndY2('เสียชีวิต'); setDndY3('เสียชีวิต') }
                  }
                }}
                y3={alcStatus3} setY3={(v) => {
                  setAlcStatus3(v)
                  if (v === 'เสียชีวิต') {
                    if (hasTobacco) setTobStatus3('เสียชีวิต')
                    if (hasDnd)     setDndY3('เสียชีวิต')
                  }
                }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ผลลัพธ์รายปี</p>
              <OutcomeYearGrid values={alcOutcomes}
                onChange={(k, v) => setAlcOutcomes((p) => ({ ...p, [k]: v }))} />
            </div>
          </div>
        </div>
      </div>

      {/* ── บุหรี่ ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 text-blue-900 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Cigarette className="w-4 h-4" />
            <p className="font-bold text-sm">ผู้สูบ — ผู้สมัครร่วมโครงการเลิกบุหรี่</p>
          </div>
          <p className="text-xs opacity-60 mt-0.5 ml-6">กรอกเมื่อบุคคลนี้สูบบุหรี่หรือยาสูบ</p>
        </div>
        <div className="p-5 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={hasTobacco}
              onChange={(e) => setHasTobacco(e.target.checked)}
              className="accent-yellow-400 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">บุคคลนี้สูบบุหรี่หรือยาสูบ</span>
          </label>
          <div className={`space-y-4 transition-opacity duration-200 ${hasTobacco ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-3 pt-3 pb-2 bg-gray-50 border-b border-gray-100">
                  <label className="text-xs text-gray-500">ประเภทการสูบ</label>
                  <select value={smokeType}
                    onChange={(e) => { setSmokeType(e.target.value); setSmokeQty(''); setSmokeSocial(false); setSmokeStress(false) }}
                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    {SMOKE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {smokeType === 'สูบประจำ' && (
                  <div className="px-3 py-2.5 space-y-1.5">
                    <p className="text-xs text-gray-400">จำนวนต่อวัน</p>
                    {SMOKE_QTY.map((q) => (
                      <label key={q} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="smokeQty" value={q}
                          checked={smokeQty === q} onChange={() => setSmokeQty(q)}
                          className="accent-yellow-400 w-3.5 h-3.5" />
                        <span className={`text-xs ${smokeQty === q ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{q}</span>
                      </label>
                    ))}
                  </div>
                )}
                {smokeType === 'นานๆ ครั้ง' && (
                  <div className="px-3 py-2.5 space-y-2.5">
                    <p className="text-xs text-gray-400">โอกาสที่สูบ</p>
                    {[
                      { label: 'เวลาสังสรรค์', checked: smokeSocial, setChecked: setSmokeSocial, text: smokeSocialText, setText: setSmokeSocialText },
                      { label: 'เวลาเครียด',   checked: smokeStress, setChecked: setSmokeStress, text: smokeStressText,  setText: setSmokeStressText },
                    ].map(({ label, checked, setChecked, text, setText }) => (
                      <div key={label} className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="accent-yellow-400 w-3.5 h-3.5" />
                          <span className={`text-xs ${checked ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</span>
                        </label>
                        {checked && (
                          <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                            placeholder="อธิบายเพิ่มเติม..."
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <StatusYearCard
                y1={tobStatus}  setY1={setTobStatus}
                y2={tobStatus2} setY2={(v) => {
                  setTobStatus2(v)
                  if (v === 'เสียชีวิต') {
                    if (hasAlcohol) { setAlcStatus2('เสียชีวิต'); setAlcStatus3('เสียชีวิต') }
                    if (hasDnd)     { setDndY2('เสียชีวิต'); setDndY3('เสียชีวิต') }
                  }
                }}
                y3={tobStatus3} setY3={(v) => {
                  setTobStatus3(v)
                  if (v === 'เสียชีวิต') {
                    if (hasAlcohol) setAlcStatus3('เสียชีวิต')
                    if (hasDnd)     setDndY3('เสียชีวิต')
                  }
                }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ผลลัพธ์รายปี</p>
              <OutcomeYearGrid values={tobOutcomes}
                onChange={(k, v) => setTobOutcomes((p) => ({ ...p, [k]: v }))} />
            </div>
          </div>
        </div>
      </div>

      {/* ── ดื่มไม่ขับ ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-orange-50 text-orange-900 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <p className="font-bold text-sm">ผู้ที่ตั้งใจดื่มไม่ขับ</p>
          </div>
          <p className="text-xs opacity-60 mt-0.5 ml-6">บันทึกพฤติกรรมการดื่มแล้วขับและการตั้งใจเปลี่ยนแปลง</p>
        </div>
        <div className="p-5 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={hasDnd}
              onChange={(e) => setHasDnd(e.target.checked)}
              className="accent-yellow-400 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">บุคคลนี้เข้าร่วมโครงการดื่มไม่ขับ</span>
          </label>
          <div className={`space-y-4 transition-opacity duration-200 ${hasDnd ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">ประเภทการดื่ม (พฤติกรรมเดิม)</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {DND_TYPES.map((d, i) => (
                  <label key={d}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-orange-50 transition-colors
                      ${i < DND_TYPES.length - 1 ? 'border-b border-gray-100' : ''}
                      ${dndType === d ? 'bg-orange-50' : ''}`}>
                    <input type="radio" name="dndType" value={d}
                      checked={dndType === d} onChange={() => setDndType(d)}
                      className="accent-yellow-400 w-4 h-4 flex-shrink-0" />
                    <span className={`text-sm ${dndType === d ? 'font-semibold text-orange-800' : 'text-gray-700'}`}>{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <StatusYearCard
              y1={dndY1} setY1={setDndY1}
              y2={dndY2} setY2={(v) => {
                setDndY2(v)
                if (v === 'เสียชีวิต') {
                  if (hasAlcohol) { setAlcStatus2('เสียชีวิต'); setAlcStatus3('เสียชีวิต') }
                  if (hasTobacco) { setTobStatus2('เสียชีวิต'); setTobStatus3('เสียชีวิต') }
                }
              }}
              y3={dndY3} setY3={(v) => {
                setDndY3(v)
                if (v === 'เสียชีวิต') {
                  if (hasAlcohol) setAlcStatus3('เสียชีวิต')
                  if (hasTobacco) setTobStatus3('เสียชีวิต')
                }
              }}
              optsY1={DND_Y1} optsY2={DND_Y2} optsY3={DND_Y3}
              title="บันทึกการติดตามรายปี"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl mt-4">{error}</p>}

      <div className="flex gap-3 pb-10 pt-2">
        <button type="button" onClick={() => router.back()}
          className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={isPending}
          className="flex-1 px-4 py-3.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded-xl text-sm font-bold text-gray-900 transition-colors shadow-sm">
          {isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูลผู้เข้าร่วมโครงการ'}
        </button>
      </div>
    </form>
  )
}
