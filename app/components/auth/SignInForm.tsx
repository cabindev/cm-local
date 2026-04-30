'use client'

import { useState, FormEvent } from 'react'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      } else {
        const session = await getSession()
        if (session?.user.role === 'ADMIN') {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/'
        }
      }
    } catch {
      setError('เกิดข้อผิดพลาด โปรดลองอีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Conmunity</h2>
          <p className="text-sm text-gray-500">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-gray-600 hover:text-yellow-600 underline underline-offset-2">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-bold transition-colors ${
              isLoading
                ? 'bg-yellow-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
            }`}
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">ยังไม่มีบัญชี? </span>
          <Link href="/auth/signup" className="font-medium text-gray-800 hover:text-yellow-600 underline underline-offset-2">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  )
}
