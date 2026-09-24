'use client'

// ลบหมู่บ้าน — ต้องพิมพ์ชื่อหมู่บ้านให้ตรงก่อน เพราะลบแล้วข้อมูลที่ผูกอยู่หายทั้งหมด

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVillage } from '@/app/actions/village'
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react'

type Props = {
  id: number
  villageName: string
  villageNo: string
  personCount: number
}

export default function DeleteVillageButton({ id, villageName, villageNo, personCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const matched = typed.trim() === villageName

  function handleDelete() {
    setError('')
    startTransition(async () => {
      try {
        await deleteVillage(id, typed)
        router.push('/dashboard/villages')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ กรุณาลองใหม่')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setTyped(''); setError('') }}
        aria-label="ลบหมู่บ้าน"
        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">ลบบ้าน{villageName} หมู่ {villageNo}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    ลบแล้วกู้คืนไม่ได้ ข้อมูลที่จะหายไปพร้อมกัน ได้แก่
                    สมาชิก <span className="font-semibold text-gray-700">{personCount} คน</span>{' '}
                    ผลคัดกรอง ข้อมูลสภาพแวดล้อม และการมีส่วนร่วมขององค์กร
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด"
                className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-5 space-y-3">
              <label className="block text-xs text-gray-600">
                พิมพ์ <span className="font-semibold text-gray-900">{villageName}</span> เพื่อยืนยัน
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoFocus
                  className="mt-1.5 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </label>

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!matched || isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? 'กำลังลบ...' : 'ลบถาวร'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
