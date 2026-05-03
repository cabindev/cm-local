'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { upsertEnvItem } from '@/app/actions/health-data'

type EnvItemRow = { id: number; itemType: string; hasItem: boolean; itemCount: number; result1: string | null; result2: string | null; result3: string | null }

const ENV_ITEMS = [
  { type: 'funeral',     label: 'งานศพปลอดเหล้า' },
  { type: 'tradition',   label: 'งานประเพณีปลอดเหล้า' },
  { type: 'shop',        label: 'ร้านค้า' },
  { type: 'bannedPlace', label: 'สถานที่ห้ามดื่มห้ามขาย' },
] as const

export type EnvTableHandle = { save: () => Promise<void> }

const EnvTable = forwardRef<EnvTableHandle, { villageId: number; items: EnvItemRow[] }>(
  function EnvTable({ villageId, items }, ref) {
    const find = (type: string) => items.find((i) => i.itemType === type)
    const [rows, setRows] = useState(() =>
      ENV_ITEMS.map((e) => {
        const saved = find(e.type)
        return { type: e.type, hasItem: saved?.hasItem ?? false, result1: saved?.result1 ?? '', result2: saved?.result2 ?? '', result3: saved?.result3 ?? '' }
      })
    )

    const update = (type: string, key: string, value: string | boolean) =>
      setRows((prev) => prev.map((r) => r.type === type ? { ...r, [key]: value } : r))

    useImperativeHandle(ref, () => ({
      async save() {
        await Promise.all(rows.map((r) =>
          upsertEnvItem(villageId, r.type, { hasItem: r.hasItem, itemCount: 0, result1: r.result1 || undefined, result2: r.result2 || undefined, result3: r.result3 || undefined })
        ))
      }
    }), [villageId, rows])

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">สิ่งแวดล้อม</p>
          <p className="text-sm font-medium text-white mt-0.5">องค์ประกอบแวดล้อม</p>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 font-medium text-gray-400">สภาพแวดล้อม</th>
              <th className="text-center px-4 py-2.5 font-medium text-gray-400 w-16">มี</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ผลปีที่ 1</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ผลปีที่ 2</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-400 min-w-[160px]">ผลปีที่ 3</th>
            </tr>
          </thead>
          <tbody>
            {ENV_ITEMS.map(({ type, label }, i) => {
              const row = rows.find((r) => r.type === type)!
              return (
                <tr key={type} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === ENV_ITEMS.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-5 py-3 text-gray-700">{label}</td>
                  <td className="px-4 py-3 text-center">
                    <label className="flex items-center justify-center cursor-pointer p-2 -m-2">
                      <input type="checkbox" checked={row.hasItem}
                        onChange={(e) => update(type, 'hasItem', e.target.checked)}
                        className="w-4 h-4 accent-yellow-400" />
                    </label>
                  </td>
                  {(['result1', 'result2', 'result3'] as const).map((rk) => (
                    <td key={rk} className="px-4 py-2.5">
                      {row.hasItem ? (
                        <input type="text" value={row[rk]} onChange={(e) => update(type, rk, e.target.value)}
                          placeholder="บันทึกผล..."
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white" />
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    )
  }
)

export default EnvTable
