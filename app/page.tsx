import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, BarChart2, Users, Shield } from 'lucide-react'
import SignOutButton from '@/app/components/auth/SignOutButton'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user.role === 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-black text-xs">CM</span>
          </div>
          <span className="text-white font-bold">Conmunity</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">สวัสดี {session.user.firstName}</span>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-1.5 border border-gray-600 text-gray-300 rounded-lg text-sm hover:border-gray-400 hover:text-white transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-1.5 bg-yellow-400 text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8 text-gray-900" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
          Conmunity
        </h1>
        <p className="text-gray-400 text-lg max-w-md mb-3">
          ระบบบันทึกข้อมูลโครงการ
        </p>
        <p className="text-yellow-400 font-semibold text-xl mb-10">
          กพร
        </p>

        {!session ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-colors text-sm"
            >
              สมัครสมาชิก
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-3 border border-gray-600 text-gray-300 font-medium rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition-colors text-sm"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl px-6 py-4 text-center">
            <p className="text-gray-400 text-sm mb-1">บัญชีของคุณยังไม่มีสิทธิ์เข้าถึงระบบ</p>
            <p className="text-gray-500 text-xs">กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์</p>
          </div>
        )}
      </main>

      {/* Features */}
      <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <MapPin className="w-5 h-5 text-yellow-500" />,
              title: 'บันทึกข้อมูลหมู่บ้าน',
              desc: 'จัดเก็บข้อมูลพื้นที่โครงการพร้อมระบบค้นหา',
            },
            {
              icon: <BarChart2 className="w-5 h-5 text-yellow-500" />,
              title: 'ติดตามผล 3 ปี',
              desc: 'บันทึกผลคัดกรอง ผู้เข้าร่วม และผลติดตาม 3/6 เดือน',
            },
            {
              icon: <Users className="w-5 h-5 text-yellow-500" />,
              title: 'ครอบคลุมทุกมิติ',
              desc: 'เหล้า บุหรี่ ไม่ดื่มไม่ขับ สิ่งแวดล้อม และการมีส่วนร่วม',
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงข้อมูลได้</span>
        </div>
      </footer>
    </div>
  )
}
