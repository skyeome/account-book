import { authApi } from '@/shared/lib/data'
import { useAuth } from '@/features/auth/auth-context'
import { useLedger } from '@/features/ledger/use-ledger'
import { DIRECTION_LABELS, EVENT_LABELS, RELATION_LABELS } from '@/shared/lib/labels'
import { Button } from '@/shared/ui/Button'

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function SettingsPage() {
  const { user, configured } = useAuth()
  const { entries } = useLedger()

  function exportCsv() {
    const header = ['구분', '날짜', '이름', '관계', '종류', '금액', '메모']
    const rows = [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) =>
        [
          DIRECTION_LABELS[e.direction],
          e.date,
          e.personName,
          RELATION_LABELS[e.relation],
          EVENT_LABELS[e.eventType],
          String(e.amount),
          e.memo,
        ]
          .map(csvEscape)
          .join(','),
      )
    const csv = `\uFEFF${[header.join(','), ...rows].join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `경조사장부-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 pb-8 pt-2">
      <dl className="rounded-lg border border-line bg-white px-3 py-3 text-[14px]">
        <div className="flex justify-between py-1">
          <dt className="text-muted">계정</dt>
          <dd>{user?.email ?? user?.displayName ?? '로컬'}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-muted">저장</dt>
          <dd>{configured ? 'Firebase' : '이 기기'}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-muted">내역</dt>
          <dd>{entries.length}건</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2">
        <Button variant="outline" className="w-full" onClick={exportCsv} disabled={entries.length === 0}>
          CSV로 보내기
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => void authApi.signOut()}>
          로그아웃
        </Button>
      </div>
    </div>
  )
}
