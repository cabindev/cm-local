'use client'

import { useState, useTransition } from 'react'
import { toggleUserRole } from '@/app/actions/user'

interface Props {
  userId: number
  currentRole: 'ADMIN' | 'MEMBER'
  isSelf: boolean
}

export function RoleToggle({ userId, currentRole, isSelf }: Props) {
  const [role, setRole] = useState(currentRole)
  const [pending, startTransition] = useTransition()

  const isAdmin = role === 'ADMIN'

  function handleToggle() {
    if (isSelf) return
    startTransition(async () => {
      await toggleUserRole(userId)
      setRole(prev => prev === 'ADMIN' ? 'MEMBER' : 'ADMIN')
    })
  }

  if (isSelf) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-900 text-yellow-400">
        Admin (ฉัน)
      </span>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className="flex items-center gap-2 group"
      title={isAdmin ? 'คลิกเพื่อลดสิทธิ์เป็น Member' : 'คลิกเพื่อเพิ่มสิทธิ์เป็น Admin'}
    >
      {/* Toggle switch */}
      <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        pending ? 'opacity-50' : ''
      } ${isAdmin ? 'bg-gray-900' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
          isAdmin ? 'left-5 bg-yellow-400' : 'left-0.5 bg-white shadow'
        }`} />
      </div>
      <span className={`text-xs font-bold ${
        isAdmin ? 'text-gray-900' : 'text-gray-400'
      }`}>
        {pending ? '...' : isAdmin ? 'Admin' : 'Member'}
      </span>
    </button>
  )
}
