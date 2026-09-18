import { useEffect } from 'react'
import { useUiStore } from '@/shared/stores/ui-store'

export function Toast() {
  const toast = useUiStore((s) => s.toast)
  const clearToast = useUiStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(clearToast, 1800)
    return () => window.clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
    >
      <div className="rounded-lg bg-ink px-3 py-2 text-[13px] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
        {toast}
      </div>
    </div>
  )
}
