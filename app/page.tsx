import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, MapPin, BarChart2, Users, FileSpreadsheet } from 'lucide-react'
import SignOutButton from '@/app/components/auth/SignOutButton'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user.role === 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xs">CM</span>
          </div>
          <span className="font-semibold text-white tracking-tight">Community Driven</span>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40">{session.user.firstName}</span>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link href="/auth/signin"
                className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">
                เข้าสู่ระบบ
              </Link>
              <Link href="/auth/signup"
                className="px-4 py-2 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center py-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
          Community
          <br />
          <span className="text-yellow-400">Driven</span>
        </h1>

        <p className="text-white/40 text-lg max-w-sm leading-relaxed mb-10">
          ระบบบันทึกและติดตามข้อมูลโครงการชุมชนสุขภาวะ ครอบคลุม 3 ปี
        </p>

        {!session ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/auth/signin"
              className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors text-sm">
              เข้าสู่ระบบ
            </Link>
            <Link href="/auth/signup"
              className="px-8 py-3 border border-white/10 text-white/60 font-medium rounded-xl hover:border-white/20 hover:text-white/80 transition-colors text-sm">
              สมัครสมาชิก
            </Link>
          </div>
        ) : (
          <div className="border border-white/[0.08] rounded-xl px-6 py-4 text-center bg-white/[0.02]">
            <p className="text-white/40 text-sm mb-1">บัญชีของคุณยังรอการอนุมัติสิทธิ์</p>
            <p className="text-white/25 text-xs">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        )}
      </main>

      {/* Divider */}
      <div className="border-t border-white/[0.05] mx-8" />

      {/* Features */}
      <section className="px-8 py-16 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: MapPin,          label: 'บันทึกหมู่บ้าน'   },
            { icon: BarChart2,       label: 'ผลคัดกรอง'       },
            { icon: Users,           label: 'ติดตามรายบุคคล'  },
            { icon: FileSpreadsheet, label: 'Export รายงาน'   },
          ].map(({ icon: Icon, label }) => (
            <div key={label}
              className="flex flex-col items-center gap-2.5 py-6 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
              <Icon className="w-5 h-5 text-yellow-400/70" />
              <span className="text-white/50 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-400 rounded-md flex items-center justify-center">
            <span className="text-black font-black text-[8px]">CM</span>
          </div>
          <span>Community Driven</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          <span>เฉพาะผู้มีสิทธิ์เท่านั้น</span>
        </div>
        <span>110/287-288 ม.6 คลองกุ่ม บึงกุ่ม กทม. 10240</span>
      </footer>
    </div>
  )
}
