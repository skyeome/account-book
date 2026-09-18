import type { ReactNode } from 'react'

type Props = {
  title: string
  body?: string
  action?: ReactNode
}

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[16px] font-medium text-ink">{title}</p>
      {body ? <p className="mt-1 text-[14px] text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
