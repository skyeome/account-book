import { create } from 'zustand'

type UiState = {
  formOpen: boolean
  editingId: string | null
  toast: string | null
  openCreate: () => void
  openEdit: (id: string) => void
  closeForm: () => void
  showToast: (message: string) => void
  clearToast: () => void
}

export const useUiStore = create<UiState>((set) => ({
  formOpen: false,
  editingId: null,
  toast: null,
  openCreate: () => set({ formOpen: true, editingId: null }),
  openEdit: (id) => set({ formOpen: true, editingId: id }),
  closeForm: () => set({ formOpen: false, editingId: null }),
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
}))
