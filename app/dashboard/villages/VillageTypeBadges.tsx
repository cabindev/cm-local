type Props = {
  isKpiVillage: boolean
  isQualityVillage: boolean
  short?: boolean
}

export default function VillageTypeBadges({ isKpiVillage, isQualityVillage, short }: Props) {
  const base = 'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap'
  return (
    <>
      {isKpiVillage && (
        <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>
          {short ? 'ม.ประเมิน กพร.' : 'หมู่บ้านสู้เหล้าประเมิน กพร.'}
        </span>
      )}
      {isQualityVillage && (
        <span className={`${base} bg-sky-50 text-sky-700 border-sky-100`}>
          {short ? 'ม.คุณภาพ' : 'หมู่บ้านสู้เหล้าคุณภาพ'}
        </span>
      )}
    </>
  )
}
