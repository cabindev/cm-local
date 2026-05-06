'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface FilterOptions {
  zones: string[]
  provinces: string[]
  amphoes: string[]
  tambons: string[]
}

interface Props {
  options: FilterOptions
  zone?: string
  province?: string
  amphoe?: string
  tambon?: string
}

const sel = 'border border-gray-200 rounded-lg text-xs py-1.5 px-2 pr-6 bg-white focus:outline-none focus:border-yellow-400 appearance-none bg-no-repeat cursor-pointer disabled:opacity-40 disabled:cursor-default min-w-[120px]'
const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`

export function TableFilters({ options, zone, province, amphoe, tambon }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    const next = { zone, province, amphoe, tambon, ...overrides }
    Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`/dashboard/table?${params.toString()}`)
  }

  function clear() { router.push('/dashboard/table') }

  const hasFilter = !!(zone || province || amphoe || tambon)

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-end gap-x-4 gap-y-2">

      <FilterSelect label="ภูมิภาค" value={zone} options={options.zones}
        onChange={v => navigate({ zone: v, province: undefined, amphoe: undefined, tambon: undefined })} />

      <FilterSelect label="จังหวัด" value={province} options={options.provinces} disabled={!zone}
        onChange={v => navigate({ province: v, amphoe: undefined, tambon: undefined })} />

      <FilterSelect label="อำเภอ" value={amphoe} options={options.amphoes} disabled={!province}
        onChange={v => navigate({ amphoe: v, tambon: undefined })} />

      <FilterSelect label="ตำบล" value={tambon} options={options.tambons} disabled={!amphoe}
        onChange={v => navigate({ tambon: v })} />

      {hasFilter && (
        <button onClick={clear}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors pb-1 border-b border-dashed border-gray-300">
          ล้างตัวกรอง
        </button>
      )}
    </div>
  )
}

function FilterSelect({ label, value, options, disabled, onChange }: {
  label: string; value?: string; options: string[]
  disabled?: boolean; onChange: (v: string | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-400 font-medium">{label}</label>
      <select value={value ?? ''} disabled={disabled}
        onChange={e => onChange(e.target.value || undefined)}
        className={sel}
        style={{ backgroundImage: chevron, backgroundPosition: 'right 6px center' }}>
        <option value="">ทั้งหมด</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
