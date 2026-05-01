'use client'

import { useState } from 'react'
import YearForm from './YearForm'
import EnvTable from './EnvTable'
import CommunityOrgTable from './CommunityOrgTable'
import type { getVillageById } from '@/app/actions/village'

type Village = NonNullable<Awaited<ReturnType<typeof getVillageById>>>

export default function YearDataTabs({ village }: { village: Village }) {
  const [activeYear, setActiveYear] = useState(1)

  const getYearData = (year: number) => ({
    screening:        village.screeningResults.find((r) => r.year === year) ?? null,
    alcoholParticipant: village.alcoholParticipants.find((r) => r.year === year) ?? null,
    alcoholResult:    village.alcoholResults.find((r) => r.year === year) ?? null,
    tobaccoParticipant: village.tobaccoParticipants.find((r) => r.year === year) ?? null,
    tobaccoResult:    village.tobaccoResults.find((r) => r.year === year) ?? null,
    drinkNotDrive:    village.drinkNotDrives.find((r) => r.year === year) ?? null,
    communityStats:   village.communityStats.find((r) => r.year === year) ?? null,
  })

  return (
    <div className="space-y-6">
      {/* Year tabs — ข้อมูลเชิงปริมาณ */}
      <div>
        <div className="flex gap-2 mb-5">
          {[1, 2, 3].map((year) => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeYear === year
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-yellow-400'
              }`}
            >
              ปีที่ {year}
            </button>
          ))}
        </div>
        <YearForm villageId={village.id} year={activeYear} data={getYearData(activeYear)} />
      </div>

      {/* Cross-year sections — แสดงครบทั้ง 3 ปีในตารางเดียว */}
      <EnvTable villageId={village.id} items={village.envItems} />
      <CommunityOrgTable villageId={village.id} orgs={village.communityOrgs} />
    </div>
  )
}
