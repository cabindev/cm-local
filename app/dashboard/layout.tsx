'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardProvider } from './context/DashboardContext'
import DashboardClient from './components/DashboardClient'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/auth/signin')
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <DashboardProvider>
      <DashboardClient user={session.user}>
        {children}
      </DashboardClient>
    </DashboardProvider>
  )
}
