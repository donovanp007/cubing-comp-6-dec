'use client'

import { notFound } from 'next/navigation'

export default function DebugPage() {
  // Only allow access in development mode
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Environment Variables</h1>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</h2>
          <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined'}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
          <p className="font-mono text-sm">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
              ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
              : 'undefined'
            }
          </p>
        </div>
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold">Test Supabase Import:</h2>
          <button 
            onClick={() => {
              import('@/lib/supabase').then(({ supabase }) => {
                console.log('Supabase client URL:', (supabase as any).supabaseUrl)
                console.log('Supabase client key starts with:', (supabase as any).supabaseKey?.substring(0, 20))
                alert('Check console for Supabase client details')
              })
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Supabase Client
          </button>
        </div>
      </div>
    </div>
  )
}