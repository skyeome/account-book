export const DIRECTIONS = ['given', 'received'] as const
export type Direction = (typeof DIRECTIONS)[number]

export const EVENT_TYPES = [
  'wedding',
  'funeral',
  'dol',
  'birthday',
  'opening',
  'other',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const RELATIONS = [
  'family',
  'relative',
  'friend',
  'work',
  'school',
  'neighbor',
  'other',
] as const
export type Relation = (typeof RELATIONS)[number]

export type Person = {
  id: string
  name: string
  relation: Relation
  createdAt: number
}

export type Entry = {
  id: string
  personId: string
  personName: string
  direction: Direction
  amount: number
  eventType: EventType
  eventLabel?: string
  relation: Relation
  date: string
  memo: string
  createdAt: number
  updatedAt: number
}

export type EntryInput = {
  personName: string
  direction: Direction
  amount: number
  eventType: EventType
  eventLabel?: string
  relation: Relation
  date: string
  memo: string
}

export type SessionUser = {
  uid: string
  email: string | null
  displayName: string | null
  local: boolean
}
