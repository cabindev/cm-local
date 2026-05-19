'use client'

import { useState, useTransition } from 'react'
import { toggleUserRole } from '@/app/actions/user'

export default function RoleToggle({ userId, initialRole, currentUserId }: { userId: number; initialRole: string, currentUserId: number }) {
  const [isPending, startTransition] = useTransition()
  const [isAdmin, setIsAdmin] = useState(initialRole === 'ADMIN')

  async function handleToggle() {
    if (userId === currentUserId) return // Prevent self-demotion
    
    startTransition(async () => {
      try {
        await toggleUserRole(userId)
        setIsAdmin(!isAdmin)
      } catch (err: any) {
        alert(err.message || 'เกิดข้อผิดพลาด')
      }
    })
  }

  const isDisabled = userId === currentUserId || isPending

  return (
    <button
      onClick={handleToggle}
      disabled={isDisabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 
        ${isAdmin ? 'bg-yellow-400' : 'bg-gray-200'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${isAdmin ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}
