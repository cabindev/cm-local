'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useDashboard } from '../context/DashboardContext'
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MapPin,
  Users,
  TableProperties,
  ShieldCheck,
} from 'lucide-react'

interface NavItemProps {
  item: { name: string; href: string; icon: React.ElementType; description: string }
  collapsed: boolean
  onClick: () => void
}

function NavItem({ item, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname()
  const Icon = item.icon
  const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname?.startsWith(item.href))

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.name : ''}
      className={`
        flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${isActive ? 'bg-yellow-400 text-gray-900' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <Icon className={`flex-shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
      {!collapsed && (
        <div className="ml-3">
          <div>{item.name}</div>
          <div className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>{item.description}</div>
        </div>
      )}
    </Link>
  )
}

interface SidebarProps {
  user: {
    firstName?: string
    lastName?: string
    email?: string
    image?: string
    role?: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar } = useDashboard()

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobileSidebar(false)
    }
  }

  const overviewMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'สรุปข้อมูลโครงการ' },
  ]

  const dataMenu = [
    { name: 'หมู่บ้าน', href: '/dashboard/villages', icon: MapPin,          description: 'จัดการข้อมูลหมู่บ้าน' },
    { name: 'สมาชิก',  href: '/dashboard/members',  icon: Users,           description: 'ค้นหาสมาชิกทุกหมู่บ้าน' },
    { name: 'รายงาน',  href: '/dashboard/report',   icon: TableProperties, description: 'ตารางข้อมูล · Export Excel' },
  ]

  const systemMenu = [
    { name: 'โปรไฟล์', href: '/dashboard/profile', icon: User, description: 'ข้อมูลส่วนตัว' },
  ]

  if (user.role === 'ADMIN') {
    systemMenu.push({
      name: 'จัดการผู้ใช้งาน',
      href: '/dashboard/users',
      icon: ShieldCheck,
      description: 'กำหนดสิทธิ์ Admin',
    })
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
            <span className="font-bold text-white text-sm">Community Driven</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto" onClick={handleMenuClick}>
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-xs">CM</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => toggleMobileSidebar(false)}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

        {/* ภาพรวม */}
        {overviewMenu.map((item) => (
          <NavItem key={item.href} item={item} collapsed={sidebarCollapsed} onClick={handleMenuClick} />
        ))}

        {/* ข้อมูล ก.พ.ร */}
        <div className="pt-3">
          <div className="border-t border-gray-700 mb-3" />
          {!sidebarCollapsed && (
            <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ข้อมูล ก.พ.ร
            </p>
          )}
          {dataMenu.map((item) => (
            <NavItem key={item.href} item={item} collapsed={sidebarCollapsed} onClick={handleMenuClick} />
          ))}
        </div>

        {/* ระบบ */}
        <div className="pt-3">
          <div className="border-t border-gray-700 mb-3" />
          {!sidebarCollapsed && (
            <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ระบบ
            </p>
          )}
          {systemMenu.map((item) => (
            <NavItem key={item.href} item={item} collapsed={sidebarCollapsed} onClick={handleMenuClick} />
          ))}
        </div>
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
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          title={sidebarCollapsed ? 'ออกจากระบบ' : ''}
          className={`mt-3 flex items-center w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  )
}
