import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { createId } from '@/shared/lib/id'
import { normalizeName } from '@/shared/lib/format'
import { getFirebaseAuth, getFirestoreDb } from '@/shared/lib/firebase'
import type { AuthApi, DataRepo, DataSnapshot } from '@/shared/lib/repo'
import type { Entry, Person, SessionUser } from '@/types/models'

function peopleCol(uid: string) {
  return collection(getFirestoreDb(), 'users', uid, 'people')
}

function entriesCol(uid: string) {
  return collection(getFirestoreDb(), 'users', uid, 'entries')
}

function mapPerson(id: string, data: Record<string, unknown>): Person {
  return {
    id,
    name: String(data.name ?? ''),
    relation: (data.relation as Person['relation']) ?? 'other',
    createdAt: Number(data.createdAt ?? Date.now()),
  }
}

function mapEntry(id: string, data: Record<string, unknown>): Entry {
  return {
    id,
    personId: String(data.personId ?? ''),
    personName: String(data.personName ?? ''),
    direction: data.direction === 'received' ? 'received' : 'given',
    amount: Number(data.amount ?? 0),
    eventType: (data.eventType as Entry['eventType']) ?? 'other',
    eventLabel: data.eventLabel ? String(data.eventLabel) : undefined,
    relation: (data.relation as Entry['relation']) ?? 'other',
    date: String(data.date ?? ''),
    memo: String(data.memo ?? ''),
    createdAt: Number(data.createdAt ?? Date.now()),
    updatedAt: Number(data.updatedAt ?? Date.now()),
  }
}

async function snapshotOf(uid: string): Promise<DataSnapshot> {
  const [peopleSnap, entriesSnap] = await Promise.all([
    getDocs(peopleCol(uid)),
    getDocs(entriesCol(uid)),
  ])
  return {
    people: peopleSnap.docs.map((d) => mapPerson(d.id, d.data())),
    entries: entriesSnap.docs.map((d) => mapEntry(d.id, d.data())),
  }
}

export const firebaseRepo: DataRepo = {
  load: snapshotOf,
  subscribe(uid, onChange) {
    let people: Person[] = []
    let entries: Entry[] = []
    let gotPeople = false
    let gotEntries = false
    const emit = () => {
      if (gotPeople && gotEntries) onChange({ people, entries })
    }
    const unsubPeople = onSnapshot(peopleCol(uid), (snap) => {
      people = snap.docs.map((d) => mapPerson(d.id, d.data()))
      gotPeople = true
      emit()
    })
    const unsubEntries = onSnapshot(entriesCol(uid), (snap) => {
      entries = snap.docs.map((d) => mapEntry(d.id, d.data()))
      gotEntries = true
      emit()
    })
    return () => {
      unsubPeople()
      unsubEntries()
    }
  },
  async saveEntry(uid, input, editingId) {
    const db = getFirestoreDb()
    const peopleSnap = await getDocs(peopleCol(uid))
    const people = peopleSnap.docs.map((d) => mapPerson(d.id, d.data()))
    const normalized = normalizeName(input.personName)
    let person = people.find((p) => normalizeName(p.name) === normalized)
    const batch = writeBatch(db)
    if (!person) {
      const id = createId()
      person = {
        id,
        name: normalized,
        relation: input.relation,
        createdAt: Date.now(),
      }
      batch.set(doc(db, 'users', uid, 'people', id), {
        name: person.name,
        relation: person.relation,
        createdAt: person.createdAt,
      })
    } else if (person.relation !== input.relation) {
      batch.update(doc(db, 'users', uid, 'people', person.id), {
        relation: input.relation,
      })
    }

    const id = editingId ?? createId()
    const now = Date.now()
    const payload: Record<string, unknown> = {
      personId: person.id,
      personName: person.name,
      direction: input.direction,
      amount: input.amount,
      eventType: input.eventType,
      eventLabel: input.eventLabel ?? null,
      relation: input.relation,
      date: input.date,
      memo: input.memo,
      updatedAt: now,
      serverTime: serverTimestamp(),
    }
    if (!editingId) payload.createdAt = now
    batch.set(doc(db, 'users', uid, 'entries', id), payload, { merge: true })
    await batch.commit()
  },
  async deleteEntry(uid, id) {
    await deleteDoc(doc(getFirestoreDb(), 'users', uid, 'entries', id))
  },
}

function toSession(uid: string, email: string | null, displayName: string | null): SessionUser {
  return { uid, email, displayName, local: false }
}

export const firebaseAuth: AuthApi = {
  subscribe(onChange) {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      onChange(user ? toSession(user.uid, user.email, user.displayName) : null)
    })
  },
  async signInGoogle() {
    await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
  },
  async signInEmail(email, password) {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  },
  async signUpEmail(email, password) {
    await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
  },
  async signInLocal() {
    throw new Error('Firebase가 설정된 상태에서는 로컬 모드를 쓰지 않습니다.')
  },
  async signOut() {
    await firebaseSignOut(getFirebaseAuth())
  },
}

export async function ensureUserDoc(uid: string, email: string | null) {
  await setDoc(
    doc(getFirestoreDb(), 'users', uid),
    { email, updatedAt: Date.now() },
    { merge: true },
  )
}
