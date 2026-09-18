import { useMemo, useState } from 'react'
import { useLedger } from '@/features/ledger/use-ledger'
import { formatWon, monthOf, sumByDirection, yearOf } from '@/shared/lib/format'
import { EVENT_LABELS, RELATION_LABELS } from '@/shared/lib/labels'
import { EmptyState } from '@/shared/ui/EmptyState'
import { EVENT_TYPES, RELATIONS } from '@/types/models'
import { cn } from '@/shared/lib/cn'

export function StatsPage() {
  const { entries } = useLedger()
  const years = useMemo(() => {
    const set = new Set(entries.map((e) => yearOf(e.date)))
    const list = [...set].sort((a, b) => b - a)
    return list.length ? list : [new Date().getFullYear()]
  }, [entries])
  const [year, setYear] = useState(years[0])
  const yearEntries = useMemo(
    () => entries.filter((e) => yearOf(e.date) === year),
    [entries, year],
  )
  const totals = sumByDirection(yearEntries)

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const list = yearEntries.filter((e) => monthOf(e.date) === m)
      return { m, ...sumByDirection(list) }
    })
  }, [yearEntries])
  const maxMonth = Math.max(1, ...months.map((x) => Math.max(x.given, x.received)))

  const byEvent = EVENT_TYPES.map((t) => ({
    key: t,
    label: EVENT_LABELS[t],
    ...sumByDirection(yearEntries.filter((e) => e.eventType === t)),
  })).filter((x) => x.given + x.received > 0)

  const byRelation = RELATIONS.map((t) => ({
    key: t,
    label: RELATION_LABELS[t],
    ...sumByDirection(yearEntries.filter((e) => e.relation === t)),
  })).filter((x) => x.given + x.received > 0)

  if (entries.length === 0) {
    return <EmptyState title="통계를 볼 내역이 없습니다" body="내역을 추가하면 연도별 합계가 쌓입니다." />
  }

  return (
    <div className="px-4 pb-8 pt-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setYear(y)}
            className={cn(
              'h-8 shrink-0 rounded-md border px-2.5 text-[13px]',
              year === y ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted',
            )}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatBox label="보낸" value={totals.given} className="text-given" />
        <StatBox label="받은" value={totals.received} className="text-received" />
        <StatBox
          label="차액"
          value={totals.net}
          className={totals.net >= 0 ? 'text-received' : 'text-given'}
          signed
        />
      </div>

      <section className="mt-8">
        <h2 className="text-[15px] font-medium">월별</h2>
        <ul className="mt-3 space-y-2">
          {months.map((row) => (
            <li key={row.m} className="grid grid-cols-[2rem_1fr] items-center gap-2">
              <span className="text-[12px] text-muted">{row.m}월</span>
              <div className="space-y-1">
                <Bar color="bg-given/80" value={row.given} max={maxMonth} />
                <Bar color="bg-received/80" value={row.received} max={maxMonth} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-muted">위 막대 보낸 · 아래 막대 받은</p>
      </section>

      <Breakdown title="종류별" rows={byEvent} />
      <Breakdown title="관계별" rows={byRelation} />
    </div>
  )
}

function StatBox({
  label,
  value,
  className,
  signed,
}: {
  label: string
  value: number
  className?: string
  signed?: boolean
}) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-3">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={cn('tabular mt-1 text-[14px] font-medium', className)}>
        {signed && value > 0 ? '+' : ''}
        {formatWon(value)}
      </p>
    </div>
  )
}

function Bar({ color, value, max }: { color: string; value: number; max: number }) {
  const w = Math.round((value / max) * 100)
  return (
    <div className="h-1.5 overflow-hidden rounded-sm bg-line">
      <div className={cn('h-full rounded-sm', color)} style={{ width: `${w}%` }} />
    </div>
  )
}

function Breakdown({
  title,
  rows,
}: {
  title: string
  rows: { key: string; label: string; given: number; received: number }[]
}) {
  if (rows.length === 0) return null
  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-medium">{title}</h2>
      <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-white">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between px-3 py-3">
            <span className="text-[14px]">{r.label}</span>
            <span className="tabular text-[13px] text-muted">
              <span className="text-given">−{formatWon(r.given)}</span>
              {' · '}
              <span className="text-received">+{formatWon(r.received)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
