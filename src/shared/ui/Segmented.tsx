import { cn } from '@/shared/lib/cn'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  ariaLabel: string
}

export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-lg border border-line bg-white p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'h-9 rounded-md text-[14px] font-medium transition-colors duration-150',
              active ? 'bg-ink text-white' : 'text-muted hover:text-ink',
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
