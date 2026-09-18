import type { Direction, EventType, Relation } from '@/types/models'

export const EVENT_LABELS: Record<EventType, string> = {
  wedding: '결혼',
  funeral: '장례',
  dol: '돌잔치',
  birthday: '생일',
  opening: '개업',
  other: '기타',
}

export const RELATION_LABELS: Record<Relation, string> = {
  family: '가족',
  relative: '친척',
  friend: '친구',
  work: '직장',
  school: '학교',
  neighbor: '이웃',
  other: '기타',
}

export const DIRECTION_LABELS: Record<Direction, string> = {
  given: '보낸',
  received: '받은',
}

export const AMOUNT_CHIPS = [30_000, 50_000, 100_000, 200_000, 300_000, 500_000]
