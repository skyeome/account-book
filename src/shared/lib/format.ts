import type { Entry } from '@/types/models'

export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

export function formatWonShort(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}${Math.abs(amount).toLocaleString('ko-KR')}원`
}

export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateKo(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${y}. ${Number(m)}. ${Number(d)}.`
}

export function yearOf(iso: string): number {
  return Number(iso.slice(0, 4))
}

export function monthOf(iso: string): number {
  return Number(iso.slice(5, 7))
}

export function parseDigits(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits)
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function sumByDirection(entries: Entry[]) {
  let given = 0
  let received = 0
  for (const e of entries) {
    if (e.direction === 'given') given += e.amount
    else received += e.amount
  }
  return { given, received, net: received - given }
}
