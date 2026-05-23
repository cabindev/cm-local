import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPerson } from '@/app/actions/person'
import { getVillage } from '@/app/actions/village'
import { ArrowLeft } from 'lucide-react'
import PersonEditForm from './PersonEditForm'

type Props = { params: Promise<{ id: string; personId: string }> }

export default async function EditPersonPage({ params }: Props) {
  const { id, personId } = await params
  const [village, person] = await Promise.all([
    getVillage(parseInt(id)),
    getPerson(parseInt(personId)),
  ])
  if (!village || !person) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        href={`/dashboard/villages/${village.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับ บ้าน{village.villageName}
      </Link>

      <div>
        <h1 className="text-2xl font-black text-gray-900">แก้ไขข้อมูลผู้เข้าร่วมโครงการ</h1>
        <p className="text-sm text-gray-500 mt-0.5">{person.name} · บ้าน{village.villageName}</p>
      </div>

      <PersonEditForm person={person} villageId={village.id} />
    </div>
  )
}
