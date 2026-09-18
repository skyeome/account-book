import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-lg px-4 text-[15px] font-medium transition-colors duration-150 disabled:opacity-50',
        variant === 'primary' && 'bg-brand text-white hover:bg-[#7c2d12]',
        variant === 'ghost' && 'text-ink hover:bg-black/5',
        variant === 'outline' && 'border border-line bg-white text-ink hover:bg-black/[0.03]',
        variant === 'danger' && 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
        className,
      )}
      {...props}
    />
  )
}
