import { cn } from '@/shared/lib/cn'

type Option<T extends string | number> = { value: T; label: string }

type Props<T extends string | number> = {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  ariaLabel: string
}

export function ChipGroup<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            className={cn(
              'h-8 rounded-md border px-2.5 text-[13px] transition-colors duration-150',
              active
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-muted hover:border-ink/30 hover:text-ink',
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
