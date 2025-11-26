import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  Medal,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg">🧊</span>
            </div>
            <span className="font-bold text-lg">Cubing Hub</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />}>
              Dashboard
            </NavItem>
            <NavItem href="/dashboard/students" icon={<Users className="h-5 w-5" />}>
              Students
            </NavItem>
            <NavItem href="/dashboard/competitions" icon={<Trophy className="h-5 w-5" />}>
              Competitions
            </NavItem>
            <NavItem href="/dashboard/weekly" icon={<Calendar className="h-5 w-5" />}>
              Termly Leagues
            </NavItem>
            <NavItem href="/dashboard/rankings" icon={<Medal className="h-5 w-5" />}>
              Rankings
            </NavItem>
            <NavItem href="/dashboard/reports" icon={<BarChart3 className="h-5 w-5" />}>
              Reports
            </NavItem>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>
                Settings
              </NavItem>
              <NavItem href="/logout" icon={<LogOut className="h-5 w-5" />}>
                Logout
              </NavItem>
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                C
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Coach</p>
                <p className="text-xs text-gray-500 truncate">coach@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}
