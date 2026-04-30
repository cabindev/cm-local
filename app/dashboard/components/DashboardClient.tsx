'use client'

import { useDashboard } from '../context/DashboardContext'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

interface DashboardClientProps {
  user: {
    firstName?: string
    lastName?: string
    email?: string
    image?: string
    role?: string
  }
  children: React.ReactNode
}

export default function DashboardClient({ user, children }: DashboardClientProps) {
  const { sidebarCollapsed, isMobileSidebarOpen, toggleMobileSidebar } = useDashboard()

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => toggleMobileSidebar(false)}
        />
      )}

      <Sidebar user={user} />

      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <TopNav />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
