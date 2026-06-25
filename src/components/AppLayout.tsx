import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/practice', label: 'Practice' },
  { to: '/test', label: 'Timed Test' },
  { to: '/mistakes', label: 'Journal' },
  { to: '/settings', label: 'Settings' },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <aside className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0 md:px-5 md:py-6">
        <div className="mb-8 hidden md:block">
          <p className="text-2xl font-black tracking-normal text-lagoon-600">MathPrep</p>
          <p className="mt-1 text-sm text-slate-500">Build skill one question at a time.</p>
        </div>
        <nav className="grid grid-cols-5 gap-1 md:flex md:flex-col md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-2 py-3 text-center text-xs font-semibold transition md:px-3 md:text-left md:text-sm ${
                  isActive
                    ? 'bg-lagoon-100 text-lagoon-600'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-5 md:ml-64 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
