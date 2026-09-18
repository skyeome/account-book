import { Link } from 'react-router'
import { useMemo } from 'react'
import { useLedger } from '@/features/ledger/use-ledger'
import { formatDateKo, formatWon, sumByDirection, yearOf } from '@/shared/lib/format'
import { DIRECTION_LABELS, EVENT_LABELS } from '@/shared/lib/labels'
import { useUiStore } from '@/shared/stores/ui-store'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { cn } from '@/shared/lib/cn'

export function HomePage() {
  const { entries, people } = useLedger()
  const openCreate = useUiStore((s) => s.openCreate)
  const year = new Date().getFullYear()

  const yearEntries = useMemo(
    () => entries.filter((e) => yearOf(e.date) === year),
    [entries, year],
  )
  const totals = sumByDirection(yearEntries)
  const recent = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5),
    [entries],
  )
  const repay = useMemo(() => {
    const map = new Map<string, { name: string; given: number; received: number }>()
    for (const e of entries) {
      const cur = map.get(e.personId) ?? { name: e.personName, given: 0, received: 0 }
      if (e.direction === 'given') cur.given += e.amount
      else cur.received += e.amount
      map.set(e.personId, cur)
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v, net: v.received - v.given }))
      .filter((p) => p.net > 0)
      .sort((a, b) => b.net - a.net)
      .slice(0, 3)
  }, [entries])

  if (entries.length === 0 && people.length === 0) {
    return (
      <EmptyState
        title="첫 경조사를 기록하세요"
        body="보낸 돈과 받은 돈을 이름만 적으면 됩니다."
        action={<Button onClick={openCreate}>내역 추가</Button>}
      />
    )
  }

  return (
    <div className="px-4 pb-8 pt-2">
      <p className="text-[13px] text-muted">{year}년</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Summary label="보낸" value={totals.given} tone="given" />
        <Summary label="받은" value={totals.received} tone="received" />
        <Summary label="차액" value={totals.net} tone={totals.net >= 0 ? 'received' : 'given'} signed />
      </div>

      {repay.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">아직 돌려줄 사람</h2>
            <Link to="/people" className="text-[13px] text-muted">
              사람
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-white">
            {repay.map((p) => (
              <li key={p.id}>
                <Link to={`/people/${p.id}`} className="flex items-center justify-between px-3 py-3">
                  <span className="text-[15px]">{p.name}</span>
                  <span className="tabular text-[14px] text-received">{formatWon(p.net)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-medium">최근 내역</h2>
          <Link to="/entries" className="text-[13px] text-muted">
            전체
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-white">
          {recent.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-3 py-3">
              <div>
                <p className="text-[15px]">{e.personName}</p>
                <p className="text-[12px] text-muted">
                  {formatDateKo(e.date)} · {EVENT_LABELS[e.eventType]} · {DIRECTION_LABELS[e.direction]}
                </p>
              </div>
              <span
                className={cn(
                  'tabular text-[15px]',
                  e.direction === 'given' ? 'text-given' : 'text-received',
                )}
              >
                {e.direction === 'given' ? '−' : '+'}
                {formatWon(e.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Summary({
  label,
  value,
  tone,
  signed,
}: {
  label: string
  value: number
  tone: 'given' | 'received'
  signed?: boolean
}) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-3">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={cn('tabular mt-1 text-[15px] font-medium', tone === 'given' ? 'text-given' : 'text-received')}>
        {signed && value > 0 ? '+' : ''}
        {formatWon(value)}
      </p>
    </div>
  )
}
