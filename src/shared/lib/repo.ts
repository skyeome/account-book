import type { Entry, EntryInput, Person, SessionUser } from '@/types/models'

export type DataSnapshot = {
  people: Person[]
  entries: Entry[]
}

export type DataRepo = {
  load(uid: string): Promise<DataSnapshot>
  subscribe(uid: string, onChange: (data: DataSnapshot) => void): () => void
  saveEntry(uid: string, input: EntryInput, editingId?: string): Promise<void>
  deleteEntry(uid: string, id: string): Promise<void>
}

export type AuthApi = {
  subscribe(onChange: (user: SessionUser | null) => void): () => void
  signInGoogle(): Promise<void>
  signInEmail(email: string, password: string): Promise<void>
  signUpEmail(email: string, password: string): Promise<void>
  signInLocal(): Promise<void>
  signOut(): Promise<void>
}
