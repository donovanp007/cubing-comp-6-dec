'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CubingHub CRM</h1>
          <p className="text-gray-600">Comprehensive school program management</p>
        </div>
        
        {mode === 'login' ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignupForm 
            onToggleMode={toggleMode} 
            allowRoleSelection={false} // Only admins can create accounts with roles
          />
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  )
}