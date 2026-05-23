import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getVillage } from '@/app/actions/village'
import EvaluateClient from './EvaluateClient'

type Props = { params: Promise<{ id: string }> }

export default async function EvaluatePage({ params }: Props) {
  const { id } = await params
  const village = await getVillage(parseInt(id))
  if (!village) notFound()

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <Link
        href={`/dashboard/villages/${village.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับ บ้าน{village.villageName}
      </Link>

      <div>
        <h1 className="text-2xl font-black text-gray-900">ประเมินผู้เข้าร่วมโครงการ</h1>
        <p className="text-sm text-gray-500 mt-0.5">บ้าน{village.villageName} · {village.persons.length} คน</p>
      </div>

      <EvaluateClient villageId={village.id} persons={village.persons} />
    </div>
  )
}
