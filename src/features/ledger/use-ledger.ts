import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { repo } from '@/shared/lib/data'
import { useAuth } from '@/features/auth/auth-context'
import type { DataSnapshot } from '@/shared/lib/repo'

const empty: DataSnapshot = { people: [], entries: [] }

export function ledgerKey(uid: string) {
  return ['ledger', uid] as const
}

export function useLedger() {
  const { user } = useAuth()
  const uid = user?.uid
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: uid ? ledgerKey(uid) : ['ledger', 'none'],
    queryFn: () => (uid ? repo.load(uid) : Promise.resolve(empty)),
    enabled: Boolean(uid),
  })

  useEffect(() => {
    if (!uid) return
    return repo.subscribe(uid, (data) => {
      queryClient.setQueryData(ledgerKey(uid), data)
    })
  }, [uid, queryClient])

  return {
    people: query.data?.people ?? [],
    entries: query.data?.entries ?? [],
    isLoading: query.isLoading,
    uid: uid ?? '',
  }
}
