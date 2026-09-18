import { createId } from '@/shared/lib/id'
import { normalizeName } from '@/shared/lib/format'
import type { AuthApi, DataRepo, DataSnapshot } from '@/shared/lib/repo'
import type { Entry, EntryInput, Person, SessionUser } from '@/types/models'

const USER_KEY = 'ledger:local-user'
const dataKey = (uid: string) => `ledger:data:${uid}`

function empty(): DataSnapshot {
  return { people: [], entries: [] }
}

function read(uid: string): DataSnapshot {
  try {
    const raw = localStorage.getItem(dataKey(uid))
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as DataSnapshot
    return {
      people: parsed.people ?? [],
      entries: parsed.entries ?? [],
    }
  } catch {
    return empty()
  }
}

function write(uid: string, data: DataSnapshot) {
  localStorage.setItem(dataKey(uid), JSON.stringify(data))
  window.dispatchEvent(new Event('ledger-local-change'))
}

function upsertPerson(data: DataSnapshot, name: string, relation: EntryInput['relation']): Person {
  const normalized = normalizeName(name)
  const existing = data.people.find((p) => normalizeName(p.name) === normalized)
  if (existing) {
    if (existing.relation !== relation) {
      existing.relation = relation
    }
    return existing
  }
  const person: Person = {
    id: createId(),
    name: normalized,
    relation,
    createdAt: Date.now(),
  }
  data.people.push(person)
  return person
}

export const localRepo: DataRepo = {
  async load(uid) {
    return read(uid)
  },
  subscribe(uid, onChange) {
    const emit = () => onChange(read(uid))
    emit()
    const onStorage = (e: StorageEvent) => {
      if (e.key === dataKey(uid)) emit()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('ledger-local-change', emit)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ledger-local-change', emit)
    }
  },
  async saveEntry(uid, input, editingId) {
    const data = read(uid)
    const person = upsertPerson(data, input.personName, input.relation)
    const now = Date.now()
    if (editingId) {
      const idx = data.entries.findIndex((e) => e.id === editingId)
      if (idx === -1) throw new Error('내역을 찾을 수 없습니다.')
      const prev = data.entries[idx]
      data.entries[idx] = {
        ...prev,
        personId: person.id,
        personName: person.name,
        direction: input.direction,
        amount: input.amount,
        eventType: input.eventType,
        eventLabel: input.eventLabel,
        relation: input.relation,
        date: input.date,
        memo: input.memo,
        updatedAt: now,
      }
    } else {
      const entry: Entry = {
        id: createId(),
        personId: person.id,
        personName: person.name,
        direction: input.direction,
        amount: input.amount,
        eventType: input.eventType,
        eventLabel: input.eventLabel,
        relation: input.relation,
        date: input.date,
        memo: input.memo,
        createdAt: now,
        updatedAt: now,
      }
      data.entries.push(entry)
    }
    write(uid, data)
  },
  async deleteEntry(uid, id) {
    const data = read(uid)
    data.entries = data.entries.filter((e) => e.id !== id)
    write(uid, data)
  },
}

const LOCAL_USER: SessionUser = {
  uid: 'local',
  email: null,
  displayName: '로컬',
  local: true,
}

export const localAuth: AuthApi = {
  subscribe(onChange) {
    const emit = () => {
      const raw = localStorage.getItem(USER_KEY)
      onChange(raw ? LOCAL_USER : null)
    }
    emit()
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY) emit()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('ledger-auth-change', emit)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ledger-auth-change', emit)
    }
  },
  async signInGoogle() {
    throw new Error('Firebase 설정이 필요합니다.')
  },
  async signInEmail() {
    throw new Error('Firebase 설정이 필요합니다.')
  },
  async signUpEmail() {
    throw new Error('Firebase 설정이 필요합니다.')
  },
  async signInLocal() {
    localStorage.setItem(USER_KEY, '1')
    window.dispatchEvent(new Event('ledger-auth-change'))
  },
  async signOut() {
    localStorage.removeItem(USER_KEY)
    window.dispatchEvent(new Event('ledger-auth-change'))
  },
}
