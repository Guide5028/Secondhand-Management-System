import { Outlet, NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'ภาพรวม',         icon: '📊' },
  { to: '/stock',     label: 'สต็อกคงเหลือ',   icon: '📦' },
  { to: '/purchase',  label: 'ซื้อเข้า',        icon: '⬇️' },
  { to: '/sale',      label: 'ขายออก',          icon: '⬆️' },
  { to: '/history',   label: 'ประวัติรายการ',   icon: '📋' },
  { to: '/daily',     label: 'P&L รายวัน',      icon: '📝' },
  { to: '/products',  label: 'จัดการสินค้า',    icon: '⚙️' },
]

export default function Layout() {
  const location = useLocation()

  // หาชื่อหน้าปัจจุบัน สำหรับ topbar
  const currentPage = NAV.find(n => location.pathname.startsWith(n.to))

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ===== SIDEBAR ===== */}
      <aside className="w-[220px] flex-shrink-0 bg-slate-900 text-white flex flex-col">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="text-lg font-semibold tracking-tight">ไชยศิลา ค้าของเก่า</div>
          <div className="text-xs text-slate-400 mt-0.5">Chaisila Recycle</div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                 ${isActive
                   ? 'bg-brand-600 text-white font-medium'
                   : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Branch badge (MAIN/MVP) */}
        <div className="px-5 py-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            <span className="text-xs text-slate-400">สาขาหลัก (MAIN)</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6 flex-shrink-0">
          <h1 className="text-base font-semibold text-slate-800">
            {currentPage?.label ?? 'Kankrong'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {new Date().toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
