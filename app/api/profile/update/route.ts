import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = Number(session.user.id)
  const formData = await req.formData()

  const firstName = formData.get('firstName') as string | null
  const lastName  = formData.get('lastName')  as string | null
  const image     = formData.get('image')     as File   | null

  const data: Record<string, string> = {}
  if (firstName?.trim()) data.firstName = firstName.trim()
  if (lastName?.trim())  data.lastName  = lastName.trim()

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
