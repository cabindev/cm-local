import { getServerSession } from 'next-auth'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { redirect } from 'next/navigation'
import MemberSignOutButton from '@/app/components/MemberSignOutButton'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/dashboard')
  }

  // MEMBER — ไม่มีสิทธิ์เข้า dashboard
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl font-black text-gray-900">
            {session.user.firstName?.charAt(0)}{session.user.lastName?.charAt(0)}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          สวัสดี {session.user.firstName}
        </h2>
        <p className="text-sm text-gray-500">
          บัญชีของคุณยังไม่มีสิทธิ์เข้าถึงระบบ<br />กรุณาติดต่อผู้ดูแลระบบ
        </p>
        <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
          MEMBER
        </span>
        <MemberSignOutButton />
      </div>
    </div>
  )
}
