'use client'

import { useState } from 'react'
import AuthPage from '@/components/auth/auth-page'
import AdminDashboard from '@/components/dashboards/admin-dashboard'
import ClientDashboard from '@/components/dashboards/client-dashboard'

interface User {
  id: string
  email: string
  name: string
  type: 'admin' | 'client'
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  if (!isLoggedIn || !user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <main className="min-h-screen">
      {user.type === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} />}
      {user.type === 'client' && <ClientDashboard user={user} onLogout={handleLogout} />}
    </main>
  )
}
