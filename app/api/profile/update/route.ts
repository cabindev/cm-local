import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { PROVINCE_ZONE } from '@/app/lib/province-zone'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = Number(session.user.id)
  const formData = await req.formData()

  const firstName = formData.get('firstName') as string | null
  const lastName  = formData.get('lastName')  as string | null
  const image     = formData.get('image')     as File   | null
  const district  = formData.get('district')  as string | null   // ตำบล
  const amphoe    = formData.get('amphoe')    as string | null
  const province  = formData.get('province')  as string | null

  const data: Record<string, string | null> = {}
  if (firstName?.trim()) data.firstName = firstName.trim()
  if (lastName?.trim())  data.lastName  = lastName.trim()

  // พื้นที่รับผิดชอบ — ภาคคำนวณจากจังหวัดฝั่ง server ไม่รับค่าจาก client
  if (province !== null) {
    if (province.trim()) {
      data.province = province.trim()
      data.amphoe   = amphoe?.trim() || null
      data.district = district?.trim() || null
      data.zone     = PROVINCE_ZONE[province.trim()] ?? null
    } else {
      data.province = null
      data.amphoe   = null
      data.district = null
      data.zone     = null
    }
  }

  if (image && image.size > 0) {
    const imgDir = path.join(process.cwd(), 'public/img')
    await fs.mkdir(imgDir, { recursive: true })
    const buf = Buffer.from(await image.arrayBuffer())
    const fileName = `${Date.now()}.jpg`
    await fs.writeFile(path.join(imgDir, fileName), buf)
    data.image = `/img/${fileName}`
  }

  const updated = await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ ok: true, image: updated.image })
}
