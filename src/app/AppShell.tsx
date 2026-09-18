import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { BarChart3, BookUser, Home, Plus, Receipt, Settings } from 'lucide-react'
import { EntryForm } from '@/features/entries/EntryForm'
import { cn } from '@/shared/lib/cn'
import { useUiStore } from '@/shared/stores/ui-store'
import { Toast } from '@/shared/ui/Toast'

const TITLES: Record<string, string> = {
  '/': '홈',
  '/entries': '내역',
  '/people': '사람',
  '/stats': '통계',
  '/settings': '설정',
}

export function AppShell() {
  const location = useLocation()
  const openCreate = useUiStore((s) => s.openCreate)
  const title = location.pathname.startsWith('/people/')
    ? '사람'
    : (TITLES[location.pathname] ?? '경조사 장부')

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-app flex-col bg-paper">
      <header className="flex h-14 items-center justify-between px-4">
        <h1 className="text-[18px] font-semibold tracking-tight">{title}</h1>
        {location.pathname === '/' ? (
          <NavLink
            to="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-black/5"
            aria-label="설정"
          >
            <Settings size={20} />
          </NavLink>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="grid h-14 grid-cols-5 items-center">
          <Tab to="/" icon={<Home size={20} />} label="홈" />
          <Tab to="/entries" icon={<Receipt size={20} />} label="내역" />
          <button
            type="button"
            onClick={openCreate}
            className="flex flex-col items-center justify-center text-brand"
            aria-label="내역 추가"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <Plus size={20} />
            </span>
          </button>
          <Tab to="/people" icon={<BookUser size={20} />} label="사람" />
          <Tab to="/stats" icon={<BarChart3 size={20} />} label="통계" />
        </div>
      </nav>

      <EntryForm />
      <Toast />
    </div>
  )
}

function Tab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-0.5 text-[11px]',
          isActive ? 'text-ink' : 'text-muted',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
