import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/features/auth/auth-context'
import { LoginPage } from '@/features/auth/LoginPage'
import { EntriesPage } from '@/features/entries/EntriesPage'
import { HomePage } from '@/features/home/HomePage'
import { PeoplePage } from '@/features/people/PeoplePage'
import { PersonDetailPage } from '@/features/people/PersonDetailPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { StatsPage } from '@/features/stats/StatsPage'
import { AppShell } from '@/app/AppShell'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5_000, retry: 1, refetchOnWindowFocus: false },
  },
})

function Guard() {
  const { user, ready } = useAuth()
  if (!ready) {
    return <div className="grid min-h-svh place-items-center text-[14px] text-muted">불러오는 중</div>
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicOnly() {
  const { user, ready } = useAuth()
  if (!ready) {
    return <div className="grid min-h-svh place-items-center text-[14px] text-muted">불러오는 중</div>
  }
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<Guard />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/entries" element={<EntriesPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/people/:id" element={<PersonDetailPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
