'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Wine, Cigarette, Car, Pencil, Trash2, Search, Printer, Download } from 'lucide-react'
import { deletePerson } from '@/app/actions/person'
import * as XLSX from 'xlsx'

type Person = {
  id: number
  name: string
  createdAt: Date
  alcohol: any
  tobacco: any
  dnd: any
}

export default function MembersTable({ villageId, persons, villageName }: { villageId: number; persons: Person[]; villageName: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const filtered = query.trim()
    ? persons.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : persons

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคุณ ${name}?`)) return
    setIsDeleting(true)
    try {
      await deletePerson(id, villageId)
      router.refresh()
    } catch {
      alert('เกิดข้อผิดพลาดในการลบสมาชิก')
    } finally {
      setIsDeleting(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleExportExcel() {
    const data = filtered.map((p, index) => ({
      'ลำดับ': index + 1,
      'ชื่อ-นามสกุล': p.name,
      'โครงการเลิกเหล้า': p.alcohol ? `เข้าร่วม (${p.alcohol.drinkType})` : '-',
      'สถานะเหล้า ปี 1': p.alcohol?.statusY1 || '-',
      'สถานะเหล้า ปี 2': p.alcohol?.statusY2 || '-',
      'สถานะเหล้า ปี 3': p.alcohol?.statusY3 || '-',
      'โครงการเลิกบุหรี่': p.tobacco ? `เข้าร่วม (${p.tobacco.smokeType})` : '-',
      'สถานะบุหรี่ ปี 1': p.tobacco?.statusY1 || '-',
      'สถานะบุหรี่ ปี 2': p.tobacco?.statusY2 || '-',
      'สถานะบุหรี่ ปี 3': p.tobacco?.statusY3 || '-',
      'โครงการดื่มไม่ขับ': p.dnd ? `เข้าร่วม (${p.dnd.drinkType})` : '-',
      'ดื่มไม่ขับ ปี 1': p.dnd?.year1Result || '-',
      'ดื่มไม่ขับ ปี 2': p.dnd?.year2Result || '-',
      'ดื่มไม่ขับ ปี 3': p.dnd?.year3Result || '-',
    }))

    const ws = XLSX.utils.json_to_sheet(data)

    // Set auto width for columns
    const wscols = [
      { wch: 10 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }
    ]
    ws['!cols'] = wscols

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "รายชื่อสมาชิก")
    XLSX.writeFile(wb, `รายชื่อสมาชิก_บ้าน${villageName}.xlsx`)
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อนามสกุล..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">พิมพ์รายชื่อ</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-sm font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <Link
            href={`/dashboard/villages/${villageId}/persons/new`}
            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มสมาชิก
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-sm text-left print:text-xs">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold print:bg-transparent print:border-b-2 print:border-black print:text-black">
            <tr>
              <th className="px-6 py-3 w-16 print:px-2">ลำดับ</th>
              <th className="px-6 py-3 print:px-2">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 w-96 print:px-2">โครงการที่เข้าร่วม</th>
              <th className="px-6 py-3 text-right print:hidden w-32">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 print:divide-gray-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {query ? 'ไม่พบชื่อที่ค้นหา' : 'ยังไม่มีสมาชิกในระบบ'}
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors print:break-inside-avoid print:hover:bg-transparent ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="px-6 py-4 text-gray-500 print:text-black print:px-2">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 print:px-2">{p.name}</td>
                  <td className="px-6 py-4 print:px-2">
                    <div className="flex flex-wrap gap-1.5 print:gap-2">
                      {p.alcohol && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md print:border-none print:bg-transparent print:text-black print:p-0">
                          <Wine className="w-3 h-3 print:hidden" /> เลิกเหล้า
                        </span>
                      )}
                      {p.tobacco && (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md print:border-none print:bg-transparent print:text-black print:p-0">
                          <Cigarette className="w-3 h-3 print:hidden" /> เลิกบุหรี่
                        </span>
                      )}
                      {p.dnd && (
                        <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md print:border-none print:bg-transparent print:text-black print:p-0">
                          <Car className="w-3 h-3 print:hidden" /> ดื่มไม่ขับ
                        </span>
                      )}
                      {!p.alcohol && !p.tobacco && !p.dnd && (
                        <span className="text-gray-400 text-xs print:text-black">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right print:hidden">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/villages/${villageId}/persons/${p.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-yellow-400 text-gray-600 hover:text-gray-900 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
