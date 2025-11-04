import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import TopNavbar from '@/components/navigation/TopNavbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Cubing Hub CRM',
  description: 'Student management system for The Cubing Hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <TopNavbar />
            <main className="pt-0">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}