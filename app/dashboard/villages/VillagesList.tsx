'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Users, ChevronRight, Search, X } from 'lucide-react'

type Village = {
  id: number
  villageName: string
  villageNo: string
  tambon: string
  amphoe: string
  province: string
  zone: string
  createdAt: string | Date
  _count: { persons: number }
}

export default function VillagesList({ villages }: { villages: Village[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? villages.filter((v) =>
        `${v.villageName} ${v.tambon} ${v.amphoe} ${v.province}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : villages

  const latest = filtered[0]
  const older = filtered.slice(1)

  return (
    <div className="space-y-3">
      {/* ช่องค้นหา */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาหมู่บ้าน ตำบล อำเภอ จังหวัด..."
          className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {query && filtered.length > 0 && (
        <p className="text-xs text-gray-400 px-1">พบ {filtered.length} จาก {villages.length} หมู่บ้าน</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-10 text-center">
          <p className="text-sm text-gray-400">ไม่พบหมู่บ้านที่ค้นหา</p>
          <button onClick={() => setQuery('')} className="mt-2 text-xs text-yellow-600 hover:underline">
            ล้างการค้นหา
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* อันล่าสุด — แสดงใหญ่ */}
          <Link
            href={`/dashboard/villages/${latest.id}`}
            className="flex items-center justify-between bg-white rounded-2xl border-2 border-yellow-400 px-5 py-5 hover:shadow-md transition-all group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">ล่าสุด</span>
                </div>
                <p className="text-base font-black text-gray-900 group-hover:text-yellow-600 transition-colors">
                  บ้าน{latest.villageName}
                  <span className="ml-2 text-sm font-normal text-gray-500">หมู่ {latest.villageNo}</span>
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  ต.{latest.tambon} อ.{latest.amphoe} จ.{latest.province}
                  <span className="ml-2 text-xs text-gray-400">{latest.zone}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="font-semibold text-gray-700">{latest._count.persons}</span>
                <span className="text-gray-400">คน</span>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* อันเก่า — แสดงเล็ก */}
          {older.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {older.map((v) => (
                <Link
                  key={v.id}
                  href={`/dashboard/villages/${v.id}`}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-yellow-600 transition-colors">
                        บ้าน{v.villageName}
                        <span className="ml-1.5 text-xs font-normal text-gray-400">หมู่ {v.villageNo}</span>
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        ต.{v.tambon} อ.{v.amphoe} จ.{v.province}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{v._count.persons}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
