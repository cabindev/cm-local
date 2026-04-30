import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import authOptions from '@/app/lib/configs/auth/authOptions'
import { DashboardProvider } from './context/DashboardContext'
import DashboardClient from './components/DashboardClient'

export const metadata = {
  title: 'Dashboard | Conmunity',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <DashboardProvider>
      <DashboardClient user={session.user}>
        {children}
      </DashboardClient>
    </DashboardProvider>
  )
}
