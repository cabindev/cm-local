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
  limit: number
}

const selectClass =
  'border border-gray-200 rounded-lg text-xs py-1.5 px-2 pr-6 bg-white focus:outline-none focus:border-yellow-400 appearance-none bg-no-repeat cursor-pointer disabled:opacity-40 disabled:cursor-default min-w-[120px]'

export function VillageFilters({ options, zone, province, amphoe, tambon, limit }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)

    const next = {
      zone,
      province,
      amphoe,
      tambon,
      limit: String(limit),
      ...overrides,
    }
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    params.delete('page')
    router.push(`/dashboard/villages?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">

        {/* ภูมิภาค */}
        <FilterSelect
          label="ภูมิภาค"
          value={zone}
          options={options.zones}
          placeholder="ทั้งหมด"
          onChange={val => navigate({ zone: val, province: undefined, amphoe: undefined, tambon: undefined })}
        />

        {/* จังหวัด */}
        <FilterSelect
          label="จังหวัด"
          value={province}
          options={options.provinces}
          placeholder="ทั้งหมด"
          disabled={!zone}
          onChange={val => navigate({ province: val, amphoe: undefined, tambon: undefined })}
        />

        {/* อำเภอ */}
        <FilterSelect
          label="อำเภอ"
          value={amphoe}
          options={options.amphoes}
          placeholder="ทั้งหมด"
          disabled={!province}
          onChange={val => navigate({ amphoe: val, tambon: undefined })}
        />

        {/* ตำบล */}
        <FilterSelect
          label="ตำบล"
          value={tambon}
          options={options.tambons}
          placeholder="ทั้งหมด"
          disabled={!amphoe}
          onChange={val => navigate({ tambon: val })}
        />

        {/* spacer */}
        <div className="flex-1" />

        {/* แสดง N รายการ/หน้า */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">แสดง</span>
          <div className="relative">
            <select
              value={limit}
              onChange={e => navigate({ limit: e.target.value })}
              className={selectClass}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 6px center' }}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">รายการ/หน้า</span>
        </div>

      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  label: string
  value?: string
  options: string[]
  placeholder: string
  disabled?: boolean
  onChange: (val: string | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-400 font-medium">{label}</label>
      <div className="relative">
        <select
          value={value ?? ''}
          disabled={disabled}
          onChange={e => onChange(e.target.value || undefined)}
          className={selectClass}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 6px center' }}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
