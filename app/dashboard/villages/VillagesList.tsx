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
  _count: { persons: number }
}

export default function VillagesList({ villages }: { villages: Village[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? villages.filter((v) =>
        `${v.villageName} ${v.tambon} ${v.amphoe} ${v.province}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : villages

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

      {/* ผลลัพธ์ */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-10 text-center">
          <p className="text-sm text-gray-400">ไม่พบหมู่บ้านที่ค้นหา</p>
          <button onClick={() => setQuery('')} className="mt-2 text-xs text-yellow-600 hover:underline">
            ล้างการค้นหา
          </button>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-xs text-gray-400 px-1">พบ {filtered.length} จาก {villages.length} หมู่บ้าน</p>
          )}
          <div className="space-y-3">
            {filtered.map((v) => (
              <Link
                key={v.id}
                href={`/dashboard/villages/${v.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-4 hover:border-yellow-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                      บ้าน{v.villageName}
                      <span className="ml-2 text-sm font-normal text-gray-500">หมู่ {v.villageNo}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ต.{v.tambon} อ.{v.amphoe} จ.{v.province}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{v._count.persons} คน</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
