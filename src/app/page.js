'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {  
  Shield, 
  LogIn, 
  LayoutDashboard, 
  UserCheck, 
  Users,
  Crown,
  Loader2
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test-db')
        const data = await response.json()
        
        if (data.success) {
          setConnectionStatus('✅ Database Connected')
        } else {
          setConnectionStatus('❌ Connection Failed: ' + data.error)
        }
      } catch (error) {
        setConnectionStatus('❌ Connection Error: ' + error.message)
      }
    }

    testConnection()
  }, [])

  // Auto-redirect logged-in users to their dashboard
  useEffect(() => {
    if (status === 'loading') return // Still loading session

    if (session?.user?.role) {
      setRedirecting(true)
      const dashboardUrl = getDashboardUrl(session.user.role)
      
      // Small delay to show the redirecting message
      setTimeout(() => {
        router.push(dashboardUrl)
      }, 1000)
    }
  }, [session, status, router])

  // Get dashboard URL based on user role
  const getDashboardUrl = (role) => {
    switch (role) {
      // case 'security_supervisor':
      //   return '/supervisor-dashboard'
      case 'management':
        return '/management-dashboard'
      case 'guard':
      case 'rover':
        return '/dashboard'
      default:
        return '/dashboard'
    }
  }

  // Get role display name
  const getRoleDisplay = (role) => {
    switch (role) {
      // case 'security_supervisor':
      //   return 'Security Supervisor'
      case 'management':
        return 'Management'
      case 'guard':
        return 'Security Guard'
      case 'rover':
        return 'Rover'
      default:
        return role
    }
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      // case 'security_supervisor':
      //   return <Shield className="w-6 h-6" />
      case 'management':
        return <Crown className="w-6 h-6" />
      case 'guard':
        return <UserCheck className="w-6 h-6" />
      case 'rover':
        return <UserCheck className="w-6 h-6" />
      default:
        return <Users className="w-6 h-6" />
    }
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </main>
    )
  }

  // Show redirecting message for logged-in users
  if (session && redirecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name?.split(' ')[0]}!
          </h2>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            {getRoleIcon(session.user.role)}
            <span className="text-blue-600 font-semibold">
              {getRoleDisplay(session.user.role)}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-gray-600 mb-6">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Redirecting to your dashboard...</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">
              Taking you to the {getRoleDisplay(session.user.role)} dashboard
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Show login page for non-logged-in users
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        
        {/* App Header */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Smile 4 Life
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Security Management & Incident Reporting System
          </p>
        </div>

        {/* Login Section */}
        <div className="space-y-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Your Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to access your role-specific dashboard and manage security operations
            </p>
            
            {/* Login Button */}
            <button
              onClick={() => router.push('/login')}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl text-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <LogIn className="w-6 h-6" />
              Sign In to Dashboard
            </button>
            
            <p className="text-gray-600 mt-4">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 