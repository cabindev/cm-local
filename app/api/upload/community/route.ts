import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_MB = 10

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'รองรับเฉพาะ PDF และ Word' }, { status: 400 })
  if (file.size > MAX_MB * 1024 * 1024) return NextResponse.json({ error: `ไฟล์ต้องไม่เกิน ${MAX_MB} MB` }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads', 'community')

  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({
    fileUrl: `/uploads/community/${fileName}`,
    fileName: file.name,
  })
}
