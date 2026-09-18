import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, isFirebaseConfigured } from '@/shared/lib/data'
import { ensureUserDoc } from '@/shared/lib/firebase-repo'
import type { SessionUser } from '@/types/models'

type AuthState = {
  user: SessionUser | null
  ready: boolean
  configured: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return authApi.subscribe((next) => {
      setUser(next)
      setReady(true)
      if (next && !next.local && isFirebaseConfigured) {
        void ensureUserDoc(next.uid, next.email)
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, configured: isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider 안에서만 사용할 수 있습니다.')
  return ctx
}
