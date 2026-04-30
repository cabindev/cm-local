'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useDashboard } from '../context/DashboardContext'
import {
  LayoutDashboard,
  User,
  Users,
  Table2,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  user: {
    firstName?: string
    lastName?: string
    email?: string
    image?: string
    role?: string
  }
}

const menuItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard, description: 'ภาพรวม' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, description: 'ข้อมูลส่วนตัว' },
  { name: 'User List', href: '/dashboard/users', icon: Users, description: 'รายชื่อสมาชิก' },
  { name: 'Table', href: '/dashboard/table', icon: Table2, description: 'ตารางข้อมูล' },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar } = useDashboard()

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobileSidebar(false)
    }
  }

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 bg-gray-900 flex flex-col transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {!sidebarCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2" onClick={handleMenuClick}>
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-gray-900 font-black text-xs">CM</span>
            </div>
            <span className="font-bold text-white text-sm">Conmunity</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto" onClick={handleMenuClick}>
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-xs">CM</span>
            </div>
          </Link>
        )}

        {/* Mobile close */}
        <button
          onClick={() => toggleMobileSidebar(false)}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleMenuClick}
              title={sidebarCollapsed ? item.name : ''}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-yellow-400 text-gray-900'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`flex-shrink-0 ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <div>{item.name}</div>
                  <div className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-700 p-4">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gray-900">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          title={sidebarCollapsed ? 'ออกจากระบบ' : ''}
          className={`
            mt-3 flex items-center w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  )
}
