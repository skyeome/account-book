import { isFirebaseConfigured } from '@/shared/lib/firebase'
import { firebaseAuth, firebaseRepo } from '@/shared/lib/firebase-repo'
import { localAuth, localRepo } from '@/shared/lib/local-repo'
import type { AuthApi, DataRepo } from '@/shared/lib/repo'

export const repo: DataRepo = isFirebaseConfigured ? firebaseRepo : localRepo
export const authApi: AuthApi = isFirebaseConfigured ? firebaseAuth : localAuth
export { isFirebaseConfigured }
