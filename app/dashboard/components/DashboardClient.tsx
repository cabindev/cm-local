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

      <div className="print:hidden">
        <Sidebar user={user} />
      </div>

      <div className={`flex-1 min-w-0 min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} print:m-0 print:ml-0`}>
        <div className="print:hidden">
          <TopNav />
        </div>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  )
}
