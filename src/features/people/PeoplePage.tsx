import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { useLedger } from '@/features/ledger/use-ledger'
import { cn } from '@/shared/lib/cn'
import { formatWon } from '@/shared/lib/format'
import { RELATION_LABELS } from '@/shared/lib/labels'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useUiStore } from '@/shared/stores/ui-store'
import { Button } from '@/shared/ui/Button'

export function PeoplePage() {
  const { people, entries } = useLedger()
  const openCreate = useUiStore((s) => s.openCreate)
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const totals = new Map<string, { given: number; received: number }>()
    for (const e of entries) {
      const cur = totals.get(e.personId) ?? { given: 0, received: 0 }
      if (e.direction === 'given') cur.given += e.amount
      else cur.received += e.amount
      totals.set(e.personId, cur)
    }
    const query = q.trim().toLowerCase()
    return people
      .filter((p) => (query ? p.name.toLowerCase().includes(query) : true))
      .map((p) => {
        const t = totals.get(p.id) ?? { given: 0, received: 0 }
        return { ...p, ...t, net: t.received - t.given }
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [people, entries, q])

  if (people.length === 0) {
    return (
      <EmptyState
        title="사람이 없습니다"
        body="내역을 추가하면 이름이 여기에 모입니다."
        action={<Button onClick={openCreate}>내역 추가</Button>}
      />
    )
  }

  return (
    <div className="px-4 pb-8 pt-2">
      <label className="relative block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름 검색"
          className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[15px] outline-none focus:border-ink"
        />
      </label>

      {rows.length === 0 ? (
        <p className="mt-10 text-center text-[14px] text-muted">검색 결과가 없습니다.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-white">
          {rows.map((p) => (
            <li key={p.id}>
              <Link to={`/people/${p.id}`} className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-[15px]">{p.name}</p>
                  <p className="text-[12px] text-muted">{RELATION_LABELS[p.relation]}</p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'tabular text-[15px]',
                      p.net > 0 ? 'text-received' : p.net < 0 ? 'text-given' : 'text-muted',
                    )}
                  >
                    {p.net > 0 ? '+' : ''}
                    {formatWon(p.net)}
                  </p>
                  <p className="text-[11px] text-muted">
                    보냄 {formatWon(p.given)} · 받음 {formatWon(p.received)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
