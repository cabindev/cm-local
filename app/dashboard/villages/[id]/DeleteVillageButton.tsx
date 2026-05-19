'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVillage } from '@/app/actions/village'
import { Trash2 } from 'lucide-react'

export default function DeleteVillageButton({ id }: { id: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('ยืนยันการลบหมู่บ้านนี้? ข้อมูลทั้งหมดจะถูกลบถาวร')) return
    startTransition(async () => {
      await deleteVillage(id)
      router.push('/dashboard/villages')
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
