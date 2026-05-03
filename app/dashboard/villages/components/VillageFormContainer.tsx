'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommunityBackgroundTable, { type CommunityBackgroundTableHandle } from './CommunityBackgroundTable'
import ScreeningSection, { type ScreeningSectionHandle } from './ScreeningSection'
import AlcoholMembersTable, { type AlcoholMembersTableHandle } from './AlcoholMembersTable'
import TobaccoMembersTable, { type TobaccoMembersTableHandle } from './TobaccoMembersTable'
import DrinkNotDriveMembersTable, { type DrinkNotDriveMembersTableHandle } from './DrinkNotDriveMembersTable'
import EnvTable, { type EnvTableHandle } from './EnvTable'
import CommunityOrgTable, { type CommunityOrgTableHandle } from './CommunityOrgTable'

export default function VillageFormContainer({ villageId, data }: { villageId: number; data: VillageFormData }) {
  const bgRef = useRef<CommunityBackgroundTableHandle>(null)
  const screeningRef = useRef<ScreeningSectionHandle>(null)
  const alcoholRef = useRef<AlcoholMembersTableHandle>(null)
  const tobaccoRef = useRef<TobaccoMembersTableHandle>(null)
  const dndRef = useRef<DrinkNotDriveMembersTableHandle>(null)
  const envRef = useRef<EnvTableHandle>(null)
  const orgRef = useRef<CommunityOrgTableHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Mark dirty on any input/change inside the form
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const mark = () => setIsDirty(true)
    el.addEventListener('input', mark)
    el.addEventListener('change', mark)
    return () => {
      el.removeEventListener('input', mark)
      el.removeEventListener('change', mark)
    }
  }, [])

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await Promise.all([
        bgRef.current?.save(),
        screeningRef.current?.save(),
        alcoholRef.current?.save(),
        tobaccoRef.current?.save(),
        dndRef.current?.save(),
        envRef.current?.save(),
        orgRef.current?.save(),
      ])
      setIsDirty(false)
      router.push(`/dashboard/villages?saved=${villageId}`)
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={containerRef} className="space-y-6 pb-24">
      <CommunityBackgroundTable ref={bgRef} villageId={villageId} items={data.communityBackgrounds} />
      <ScreeningSection ref={screeningRef} villageId={villageId} screeningResults={data.screeningResults} />
      <AlcoholMembersTable ref={alcoholRef} villageId={villageId} initial={data.alcoholMembers} />
      <TobaccoMembersTable ref={tobaccoRef} villageId={villageId} initial={data.tobaccoMembers} />
      <DrinkNotDriveMembersTable ref={dndRef} villageId={villageId} initial={data.drinkNotDriveMembers} />
      <EnvTable ref={envRef} villageId={villageId} items={data.envItems} />
      <CommunityOrgTable ref={orgRef} villageId={villageId} orgs={data.communityOrgs} />

      {/* Sticky save bar — iOS safe area aware */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-8 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-end gap-4 z-20">
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
        </button>
      </div>
    </div>
  )
}

// ---- types ----
type BgRow = { id: number; itemType: string; hasItem: boolean; fileUrl: string | null; fileName: string | null }
type ScreeningRow = { id: number; year: number; screenedCount: number; alcoholRiskLow: number; alcoholRisk: number; alcoholDanger: number; alcoholAddicted: number; alcoholNone: number; tobaccoCount: number; tobaccoNone: number; drinkAndDrive: number; drinkNotDriveN: number }
type AlcoholMember = { id?: number; name: string; drinkType: string; y1Money: boolean; y1MoneyText: string; y1Property: boolean; y1PropertyText: string; y1Family: boolean; y1FamilyText: string; y1Health: boolean; y1HealthText: string; y1Work: boolean; y1WorkText: string; y1Accepted: boolean; y1AcceptedText: string; y1Other: boolean; y1OtherText: string; y2Money: boolean; y2MoneyText: string; y2Property: boolean; y2PropertyText: string; y2Family: boolean; y2FamilyText: string; y2Health: boolean; y2HealthText: string; y2Work: boolean; y2WorkText: string; y2Accepted: boolean; y2AcceptedText: string; y2Other: boolean; y2OtherText: string; y3Money: boolean; y3MoneyText: string; y3Property: boolean; y3PropertyText: string; y3Family: boolean; y3FamilyText: string; y3Health: boolean; y3HealthText: string; y3Work: boolean; y3WorkText: string; y3Accepted: boolean; y3AcceptedText: string; y3Other: boolean; y3OtherText: string }
type TobaccoMember = Omit<AlcoholMember, 'drinkType'> & { smokeType: string }
type DndMember = { id?: number; name: string; drinkType: string; year1Result: string; year2Result: string; year3Result: string }
type EnvItemRow = { id: number; itemType: string; hasItem: boolean; itemCount: number; result1: string | null; result2: string | null; result3: string | null }
type OrgRow = { id: number; orgType: string; hasParticipation: boolean; result1: string | null; result2: string | null; result3: string | null }

export type VillageFormData = {
  communityBackgrounds: BgRow[]
  screeningResults: ScreeningRow[]
  alcoholMembers: AlcoholMember[]
  tobaccoMembers: TobaccoMember[]
  drinkNotDriveMembers: DndMember[]
  envItems: EnvItemRow[]
  communityOrgs: OrgRow[]
}
