'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Printer, FileDown } from 'lucide-react'

type Village = {
  id: number
  villageName: string
  villageNo: string
  tambon: string
  amphoe: string
  province: string
  zone: string
  coordinator: string
  phone: string | null
  registeredPopulation: number
  _count: { alcoholMembers: number; tobaccoMembers: number; drinkNotDriveMembers: number }
}

interface Props {
  villages: Village[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  q?: string
  zone?: string
  province?: string
  amphoe?: string
  tambon?: string
  savedId: number | null
  exportQuery: string
}

function buildPageHref(params: { q?: string; zone?: string; province?: string; amphoe?: string; tambon?: string; limit: number }, page: number) {
  const p = new URLSearchParams()
  if (params.q)        p.set('q', params.q)
  if (params.zone)     p.set('zone', params.zone)
  if (params.province) p.set('province', params.province)
  if (params.amphoe)   p.set('amphoe', params.amphoe)
  if (params.tambon)   p.set('tambon', params.tambon)
  p.set('limit', String(params.limit))
  if (page > 1)        p.set('page', String(page))
  return `/dashboard/villages?${p.toString()}`
}

export function VillagesTable({
  villages, total, page, pageSize, totalPages,
  q, zone, province, amphoe, tambon,
  savedId, exportQuery,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const offset = (page - 1) * pageSize
  const linkParams = { q, zone, province, amphoe, tambon, limit: pageSize }

  const allOnPageSelected = villages.length > 0 && villages.every(v => selected.has(v.id))
  const someSelected = selected.size > 0

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev)
      allOnPageSelected ? villages.forEach(v => next.delete(v.id)) : villages.forEach(v => next.add(v.id))
      return next
    })
  }

  function toggleOne(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handlePrint() {
    const sel = villages.filter(v => selected.has(v.id))
    const now = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    const rows = sel.map((v, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>บ้าน${v.villageName}</td>
        <td style="text-align:center">${v.villageNo}</td>
        <td>${v.tambon}</td><td>${v.amphoe}</td><td>${v.province}</td><td>${v.zone}</td>
        <td style="text-align:right">${v.registeredPopulation.toLocaleString()}</td>
        <td style="text-align:center">${v._count.alcoholMembers}</td>
        <td style="text-align:center">${v._count.tobaccoMembers}</td>
        <td style="text-align:center">${v._count.drinkNotDriveMembers}</td>
        <td>${v.coordinator}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
      <title>รายชื่อหมู่บ้าน</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Sarabun','Tahoma',sans-serif;font-size:12px;padding:20px}
      h1{font-size:15px;font-weight:bold;text-align:center;margin-bottom:4px}.meta{text-align:center;font-size:11px;color:#555;margin-bottom:14px}
      table{width:100%;border-collapse:collapse}th{background:#f5f5f5;border:1px solid #ccc;padding:5px 7px;text-align:left;font-size:11px}
      td{border:1px solid #ccc;padding:4px 7px;font-size:11px;vertical-align:top}tr:nth-child(even) td{background:#fafafa}
      @page{size:A4 landscape;margin:1.5cm}</style></head><body>
      <h1>รายชื่อหมู่บ้านที่เลือก</h1>
      <p class="meta">วันที่พิมพ์: ${now} · ทั้งหมด ${sel.length} หมู่บ้าน</p>
      <table><thead><tr>
        <th style="width:28px">#</th><th>ชื่อหมู่บ้าน</th><th style="width:36px;text-align:center">หมู่</th>
        <th>ตำบล</th><th>อำเภอ</th><th>จังหวัด</th><th style="width:64px">ภาค</th>
        <th style="width:72px;text-align:right">ประชากร</th>
        <th style="width:52px;text-align:center">งดเหล้า</th>
        <th style="width:52px;text-align:center">งดบุหรี่</th>
        <th style="width:60px;text-align:center">ดื่มไม่ขับ</th>
        <th>ผู้ประสานงาน</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <script>window.print();window.close();</script></body></html>`

    const popup = window.open('', '_blank', 'width=1100,height=750')
    if (!popup) return
    popup.document.write(html)
    popup.document.close()
  }

  const Num = ({ n, warn }: { n: number; warn?: boolean }) => (
    <span className={`inline-flex items-center justify-center min-w-[28px] h-5 rounded text-[11px] font-semibold ${
      n === 0 ? 'text-gray-300' : warn ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
    }`}>{n}</span>
  )

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">

      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs text-gray-400">
          ทั้งหมด <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> หมู่บ้าน
          {someSelected && <span className="ml-2 text-yellow-700 font-medium">· เลือกแล้ว {selected.size} รายการ</span>}
        </span>
        <div className="flex items-center gap-2">
          {someSelected && (
            <button onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Printer className="w-3.5 h-3.5" /> ปริ้น ({selected.size})
            </button>
          )}
          <a href={`/api/villages/export${exportQuery ? `?${exportQuery}` : ''}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xs font-medium rounded-lg transition-colors">
            <FileDown className="w-3.5 h-3.5" /> Export
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2.5 w-8">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="w-3.5 h-3.5 accent-yellow-400 cursor-pointer" />
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-400 w-8">#</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-400">ชื่อหมู่บ้าน</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-400 hidden sm:table-cell">จังหวัด</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-400 hidden md:table-cell">ภาค</th>
              <th className="text-center px-3 py-2.5 font-medium text-gray-400">งดเหล้า</th>
              <th className="text-center px-3 py-2.5 font-medium text-gray-400">งดบุหรี่</th>
              <th className="text-center px-3 py-2.5 font-medium text-gray-400">ดื่มไม่ขับ</th>
              <th className="w-16 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {villages.map((v, i) => {
              const isSelected = selected.has(v.id)
              return (
                <tr key={v.id} onClick={() => toggleOne(v.id)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
                  } ${i === villages.length - 1 ? 'border-b-0' : ''}`}>

                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(v.id)} className="w-3.5 h-3.5 accent-yellow-400 cursor-pointer" />
                  </td>

                  <td className="px-3 py-3 text-gray-300">{offset + i + 1}</td>

                  <td className="px-3 py-3">
                    <Link href={`/dashboard/villages/${v.id}`} onClick={e => e.stopPropagation()}
                      className="font-medium text-gray-900 hover:text-yellow-700 transition-colors">
                      บ้าน{v.villageName}
                    </Link>
                    {savedId === v.id && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-400 text-gray-900 text-[10px] font-bold rounded-full">ล่าสุด</span>
                    )}
                    <div className="sm:hidden text-gray-400 text-[11px] mt-0.5">{v.province} · {v.zone}</div>
                  </td>

                  <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{v.province}</td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-[11px] font-medium">{v.zone}</span>
                  </td>

                  <td className="px-3 py-3 text-center"><Num n={v._count.alcoholMembers} warn /></td>
                  <td className="px-3 py-3 text-center"><Num n={v._count.tobaccoMembers} /></td>
                  <td className="px-3 py-3 text-center"><Num n={v._count.drinkNotDriveMembers} /></td>

                  <td className="px-3 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <Link href={`/dashboard/villages/${v.id}/edit`}
                      className="px-2.5 py-1 border border-gray-200 text-gray-500 rounded-lg hover:border-yellow-400 hover:text-yellow-700 transition-colors whitespace-nowrap">
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400">
            {offset + 1}–{Math.min(offset + pageSize, total)} จาก {total.toLocaleString()} รายการ
          </span>
          <div className="flex items-center gap-1">
            <Link href={buildPageHref(linkParams, page - 1)} aria-disabled={page <= 1}
              className={`p-1.5 rounded-lg border text-gray-500 transition-colors ${page <= 1 ? 'opacity-30 pointer-events-none border-gray-100' : 'border-gray-200 hover:border-yellow-400 hover:text-yellow-700'}`}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '…')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) => p === '…'
                ? <span key={`e${i}`} className="px-1.5 text-xs text-gray-300">…</span>
                : <Link key={p} href={buildPageHref(linkParams, p)}
                    className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-yellow-400 text-gray-900' : 'border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-700'}`}>
                    {p}
                  </Link>
              )}
            <Link href={buildPageHref(linkParams, page + 1)} aria-disabled={page >= totalPages}
              className={`p-1.5 rounded-lg border text-gray-500 transition-colors ${page >= totalPages ? 'opacity-30 pointer-events-none border-gray-100' : 'border-gray-200 hover:border-yellow-400 hover:text-yellow-700'}`}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
