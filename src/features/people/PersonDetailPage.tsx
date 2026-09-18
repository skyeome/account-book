import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { useLedger } from '@/features/ledger/use-ledger'
import { cn } from '@/shared/lib/cn'
import { formatDateKo, formatWon, sumByDirection } from '@/shared/lib/format'
import { DIRECTION_LABELS, EVENT_LABELS, RELATION_LABELS } from '@/shared/lib/labels'
import { useUiStore } from '@/shared/stores/ui-store'

export function PersonDetailPage() {
  const { id } = useParams()
  const { people, entries } = useLedger()
  const openEdit = useUiStore((s) => s.openEdit)
  const person = people.find((p) => p.id === id)
  const list = useMemo(
    () =>
      entries
        .filter((e) => e.personId === id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [entries, id],
  )
  const totals = sumByDirection(list)

  if (!person) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-muted">
        사람을 찾을 수 없습니다.
        <div className="mt-4">
          <Link to="/people" className="text-brand">
            목록으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8">
      <Link to="/people" className="inline-flex h-10 items-center gap-1 text-[14px] text-muted">
        <ChevronLeft size={16} />
        사람
      </Link>
      <h1 className="mt-1 text-[24px] font-semibold tracking-tight">{person.name}</h1>
      <p className="text-[14px] text-muted">{RELATION_LABELS[person.relation]}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-line bg-white px-3 py-3">
          <p className="text-[12px] text-muted">보낸</p>
          <p className="tabular mt-1 text-[14px] font-medium text-given">{formatWon(totals.given)}</p>
        </div>
        <div className="rounded-lg border border-line bg-white px-3 py-3">
          <p className="text-[12px] text-muted">받은</p>
          <p className="tabular mt-1 text-[14px] font-medium text-received">{formatWon(totals.received)}</p>
        </div>
        <div className="rounded-lg border border-line bg-white px-3 py-3">
          <p className="text-[12px] text-muted">차액</p>
          <p
            className={cn(
              'tabular mt-1 text-[14px] font-medium',
              totals.net >= 0 ? 'text-received' : 'text-given',
            )}
          >
            {totals.net > 0 ? '+' : ''}
            {formatWon(totals.net)}
          </p>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-white">
        {list.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-3 text-left"
              onClick={() => openEdit(e.id)}
            >
              <div>
                <p className="text-[14px]">
                  {EVENT_LABELS[e.eventType]} · {DIRECTION_LABELS[e.direction]}
                </p>
                <p className="text-[12px] text-muted">{formatDateKo(e.date)}</p>
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
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
