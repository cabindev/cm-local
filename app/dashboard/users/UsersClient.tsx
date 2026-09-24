'use client'

import { useState, useTransition } from 'react'
import { Shield, User as UserIcon, Trash2, Pencil, Search, X } from 'lucide-react'
import RoleToggle from './RoleToggle'
import { deleteUser, updateUserByAdmin } from '@/app/actions/user'

type UserRow = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  image: string | null
  createdAt: Date
  province: string | null
  amphoe: string | null
  district: string | null
  zone: string | null
}

function EditModal({ user, onClose, onSave }: {
  user: UserRow
  onClose: () => void
  onSave: (id: number, firstName: string, lastName: string) => Promise<void>
}) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) { setError('กรุณากรอกชื่อ-นามสกุล'); return }
    startTransition(async () => {
      try {
        await onSave(user.id, firstName.trim(), lastName.trim())
        onClose()
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาด')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อ</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">นามสกุล</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">อีเมล</label>
            <p className="text-sm text-gray-400 px-3 py-2 bg-gray-50 rounded-lg">{user.email}</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded-xl text-sm font-bold text-gray-900">
              {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersClient({ initialUsers, currentUserId, currentUserRole }: {
  initialUsers: UserRow[]
  currentUserId: number
  currentUserRole: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [zoneFilter, setZoneFilter] = useState('')
  const [editTarget, setEditTarget] = useState<UserRow | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const zones = [...new Set(users.map((u) => u.zone).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'th'))
  const noZoneCount = users.filter((u) => !u.zone).length

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase()
    const matchText = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.province ?? ''} ${u.amphoe ?? ''} ${u.zone ?? ''}`.toLowerCase().includes(q)
    const matchZone = !zoneFilter || (zoneFilter === 'none' ? !u.zone : u.zone === zoneFilter)
    return matchText && matchZone
  })

  function handleDelete(u: UserRow) {
    if (!confirm(`ลบ "${u.firstName} ${u.lastName}" ออกจากระบบ?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) return
    setDeletingId(u.id)
    startTransition(async () => {
      try {
        await deleteUser(u.id)
        setUsers(prev => prev.filter(x => x.id !== u.id))
      } catch (err: any) {
        alert(err.message || 'เกิดข้อผิดพลาด')
      } finally {
        setDeletingId(null)
      }
    })
  }

  async function handleSaveEdit(id: number, firstName: string, lastName: string) {
    await updateUserByAdmin(id, { firstName, lastName })
    setUsers(prev => prev.map(u => u.id === id ? { ...u, firstName, lastName } : u))
  }

  const canManage = (u: UserRow) => {
    if (u.id === currentUserId) return false
    if (currentUserRole === 'SUPERADMIN') return u.role !== 'SUPERADMIN'
    // ADMIN สามารถจัดการได้เฉพาะ MEMBER เท่านั้น
    return u.role === 'MEMBER'
  }

  return (
    <>
      {editTarget && (
        <EditModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Search */}
      <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ หรืออีเมล..."
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          aria-label="กรองตามภาค"
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">ทุกภาค</option>
          {zones.map((z) => <option key={z} value={z}>ภาค{z}</option>)}
          {noZoneCount > 0 && <option value="none">ยังไม่ระบุพื้นที่ ({noZoneCount})</option>}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ผู้ใช้งาน</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">สิทธิ์</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">พื้นที่</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">วันที่สมัคร</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.role === 'SUPERADMIN' ? 'bg-yellow-50/50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0
                      ${u.role === 'SUPERADMIN' ? 'bg-yellow-400 text-gray-900' : u.role === 'ADMIN' ? 'bg-gray-900 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {u.image
                        ? <img src={u.image} alt={u.firstName} className="w-full h-full object-cover" />
                        : (u.role === 'ADMIN' || u.role === 'SUPERADMIN') ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</p>
                        {u.id === currentUserId && (
                          <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">คุณ</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <RoleToggle userId={u.id} initialRole={u.role} currentUserId={currentUserId} currentUserRole={currentUserRole} />
                    {u.role !== 'SUPERADMIN' && (
                      <span className={`text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'text-gray-900' : 'text-gray-500'}`}>
                        {u.role}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.province ? (
                    <div className="space-y-1">
                      {u.zone && (
                        <span className="inline-block text-[10px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                          ภาค{u.zone}
                        </span>
                      )}
                      <p className="text-xs text-gray-500">
                        {[u.district && `ต.${u.district}`, u.amphoe && `อ.${u.amphoe}`, `จ.${u.province}`].filter(Boolean).join(' ')}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">ยังไม่ระบุ</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    {canManage(u) ? (
                      <>
                        <button
                          onClick={() => setEditTarget(u)}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id || isPending}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-200 text-xs">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                  {search ? `ไม่พบผู้ใช้ที่ตรงกับ "${search}"` : 'ยังไม่มีผู้ใช้'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-right">ทั้งหมด {filtered.length} คน{search ? ` (กรอง)` : ''}</p>
    </>
  )
}
