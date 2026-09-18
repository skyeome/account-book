import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useLedger } from '@/features/ledger/use-ledger'
import { cn } from '@/shared/lib/cn'
import { formatDateKo, formatWon, yearOf } from '@/shared/lib/format'
import { EVENT_LABELS, RELATION_LABELS } from '@/shared/lib/labels'
import { useUiStore } from '@/shared/stores/ui-store'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Segmented } from '@/shared/ui/Segmented'
import { EVENT_TYPES, type Direction, type EventType } from '@/types/models'
import { Button } from '@/shared/ui/Button'

type DirFilter = 'all' | Direction

export function EntriesPage() {
  const { entries } = useLedger()
  const openCreate = useUiStore((s) => s.openCreate)
  const openEdit = useUiStore((s) => s.openEdit)
  const [dir, setDir] = useState<DirFilter>('all')
  const [eventType, setEventType] = useState<EventType | 'all'>('all')
  const [year, setYear] = useState<number | 'all'>('all')
  const [q, setQ] = useState('')

  const years = useMemo(() => {
    const set = new Set(entries.map((e) => yearOf(e.date)))
    return [...set].sort((a, b) => b - a)
  }, [entries])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return entries
      .filter((e) => (dir === 'all' ? true : e.direction === dir))
      .filter((e) => (eventType === 'all' ? true : e.eventType === eventType))
      .filter((e) => (year === 'all' ? true : yearOf(e.date) === year))
      .filter((e) => (query ? e.personName.toLowerCase().includes(query) : true))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [entries, dir, eventType, year, q])

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return [...map.entries()]
  }, [filtered])

  if (entries.length === 0) {
    return (
      <EmptyState
        title="내역이 없습니다"
        body="보낸 돈이나 받은 돈을 추가하세요."
        action={<Button onClick={openCreate}>내역 추가</Button>}
      />
    )
  }

  return (
    <div className="px-4 pb-8 pt-2">
      <Segmented
        ariaLabel="구분 필터"
        value={dir}
        onChange={setDir}
        options={[
          { value: 'all', label: '전체' },
          { value: 'given', label: '보낸' },
          { value: 'received', label: '받은' },
        ]}
      />

      <label className="relative mt-3 block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름 검색"
          className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[15px] outline-none focus:border-ink"
        />
      </label>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        <FilterChip active={eventType === 'all'} onClick={() => setEventType('all')}>
          종류 전체
        </FilterChip>
        {EVENT_TYPES.map((t) => (
          <FilterChip key={t} active={eventType === t} onClick={() => setEventType(t)}>
            {EVENT_LABELS[t]}
          </FilterChip>
        ))}
      </div>
      {years.length > 1 ? (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip active={year === 'all'} onClick={() => setYear('all')}>
            연도 전체
          </FilterChip>
          {years.map((y) => (
            <FilterChip key={y} active={year === y} onClick={() => setYear(y)}>
              {y}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {groups.length === 0 ? (
        <p className="mt-10 text-center text-[14px] text-muted">검색 결과가 없습니다.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {groups.map(([date, list]) => (
            <section key={date}>
              <h2 className="mb-1.5 text-[13px] text-muted">{formatDateKo(date)}</h2>
              <ul className="divide-y divide-line rounded-lg border border-line bg-white">
                {list.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-3 text-left"
                      onClick={() => openEdit(e.id)}
                    >
                      <div>
                        <p className="text-[15px]">{e.personName}</p>
                        <p className="text-[12px] text-muted">
                          {EVENT_LABELS[e.eventType]} · {RELATION_LABELS[e.relation]}
                          {e.memo ? ` · ${e.memo}` : ''}
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
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string | number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 shrink-0 rounded-md border px-2.5 text-[13px]',
        active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted',
      )}
    >
      {children}
    </button>
  )
}
