// เฉดสีแผนที่รายจังหวัด — ใช้ร่วมกันระหว่างหน้าแผนที่เต็ม (dashboard/map) กับแผนที่ย่อบนหน้าภาพรวม
// ดัดแปลงจาก healthy-impact/app/lib/map-heat.ts
// เหลือง = ทั้งหมด / ประเมิน กพร. · ฟ้า = สู้เหล้าคุณภาพ (ให้ตรงกับสีป้ายประเภทหมู่บ้าน)

import type { VillageTypeFilter } from '@/app/actions/dashboard'

export type HeatTheme = { ramp: string[]; bar: string; selected: string }

const YELLOW: HeatTheme = {
  ramp: ['#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#CA8A04'],
  bar: '#FACC15',
  selected: '#FEFCE8',
}
const SKY: HeatTheme = {
  ramp: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0284C7'],
  bar: '#38BDF8',
  selected: '#F0F9FF',
}

export const heatTheme = (type?: VillageTypeFilter) => (type === 'quality' ? SKY : YELLOW)

export const HEAT_EMPTY = '#E5E7EB'

export function heatColor(value: number, max: number, ramp: string[] = YELLOW.ramp) {
  if (value <= 0) return HEAT_EMPTY
  const idx = Math.min(ramp.length - 1, Math.ceil((value / max) * ramp.length) - 1)
  return ramp[Math.max(0, idx)]
}

// ตัวเลขบนเฉดเข้มสุดต้องเป็นสีขาวถึงจะอ่านออก
export const isDarkStep = (value: number, max: number) => value > 0 && value / max > 0.8
