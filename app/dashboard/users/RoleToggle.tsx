'use client'

import { useState, useTransition } from 'react'
import { toggleUserRole } from '@/app/actions/user'
import { ShieldCheck } from 'lucide-react'

export default function RoleToggle({ userId, initialRole, currentUserId }: {
  userId: number
  initialRole: string
  currentUserId: number
}) {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState(initialRole)

  if (role === 'SUPERADMIN') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400 text-gray-900">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">SUPERADMIN</span>
        </div>
        <span className="text-[9px] text-gray-400">ล็อก — ไม่สามารถเปลี่ยนได้</span>
      </div>
    )
  }

  const isAdmin = role === 'ADMIN'
  const isDisabled = userId === currentUserId || isPending

  async function handleToggle() {
    if (isDisabled) return
    startTransition(async () => {
      try {
        await toggleUserRole(userId)
        setRole(role === 'ADMIN' ? 'MEMBER' : 'ADMIN')
      } catch (err: any) {
        alert(err.message || 'เกิดข้อผิดพลาด')
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isDisabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
        ${isAdmin ? 'bg-yellow-400' : 'bg-gray-200'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
        ${isAdmin ? 'translate-x-6' : 'translate-x-1'}
      `} />
    </button>
  )
}
