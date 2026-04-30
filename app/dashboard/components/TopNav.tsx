'use client'

import { useDashboard } from '../context/DashboardContext'
import { Menu } from 'lucide-react'

interface TopNavProps {
  title?: string
}

export default function TopNav({ title }: TopNavProps) {
  const { toggleMobileSidebar } = useDashboard()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={() => toggleMobileSidebar()}
        className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </button>
      {title && <h1 className="text-sm font-semibold text-gray-700">{title}</h1>}
    </header>
  )
}
