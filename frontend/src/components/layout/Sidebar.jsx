import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Users, PiggyBank, ArrowDownToLine,
  Bell, LogOut, Menu, X, GraduationCap,
} from 'lucide-react'
import { useState } from 'react'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Siswa', icon: GraduationCap },
  { to: '/admin/savings', label: 'Tabungan', icon: PiggyBank },
  { to: '/admin/withdrawals', label: 'Pengajuan', icon: ArrowDownToLine },
]

const waliLinks = [
  { to: '/wali', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/wali/students', label: 'Siswa Saya', icon: GraduationCap },
  { to: '/wali/withdrawals', label: 'Pengajuan', icon: ArrowDownToLine },
  { to: '/wali/reminder', label: 'Pengingat', icon: Bell },
]

export function Sidebar({ role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  const links = role === 'admin' ? adminLinks : waliLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavItems = () => (
    <>
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <span className="font-bold text-blue-600 text-lg">TabunganSiswa</span>
        <button onClick={() => setOpen(!open)} className="text-gray-600">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col h-full shadow-xl">
            <NavItems />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 fixed inset-y-0 bg-white border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="font-bold text-blue-600 text-xl">TabunganSiswa</span>
        </div>
        <NavItems />
      </aside>
    </>
  )
}
