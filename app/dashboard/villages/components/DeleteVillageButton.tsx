'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVillage } from '@/app/actions/village'
import { Trash2 } from 'lucide-react'

export default function DeleteVillageButton({ id, name }: { id: number; name: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteVillage(id)
    router.push('/dashboard/villages')
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600 font-medium">ยืนยันลบ?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '...' : 'ลบ'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
        >
          ยกเลิก
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      ลบ
    </button>
  )
}
