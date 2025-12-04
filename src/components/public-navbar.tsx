import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicNavBar() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🧊</span>
            </div>
            <span className="text-2xl font-bold text-white">Cubing Hub</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/rankings" className="text-white/80 hover:text-white transition">
              Rankings
            </Link>
            <Link href="/competitions" className="text-white/80 hover:text-white transition">
              Competitions
            </Link>
            <Link href="/parent-portal" className="text-white/80 hover:text-white transition">
              Parent Portal
            </Link>
          </div>

          {/* Coach Login Button */}
          <Link href="/login">
            <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur">
              Coach Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex gap-4 mt-4">
          <Link
            href="/rankings"
            className="flex-1 text-center px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition text-sm"
          >
            Rankings
          </Link>
          <Link
            href="/competitions"
            className="flex-1 text-center px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition text-sm"
          >
            Competitions
          </Link>
          <Link
            href="/parent-portal"
            className="flex-1 text-center px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition text-sm"
          >
            Parents
          </Link>
        </div>
      </div>
    </nav>
  );
}
