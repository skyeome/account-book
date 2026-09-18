import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/shared/lib/data'
import { useAuth } from '@/features/auth/auth-context'
import { Button } from '@/shared/ui/Button'

const schema = z.object({
  email: z.string().email('이메일을 확인하세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상입니다.'),
})

type Values = z.infer<typeof schema>

export function LoginPage() {
  const { configured } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: Values) {
    setError(null)
    setPending(true)
    try {
      if (mode === 'signin') await authApi.signInEmail(values.email, values.password)
      else await authApi.signUpEmail(values.email, values.password)
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  async function onGoogle() {
    setError(null)
    setPending(true)
    try {
      await authApi.signInGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google 로그인에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  async function onLocal() {
    setError(null)
    try {
      await authApi.signInLocal()
    } catch (e) {
      setError(e instanceof Error ? e.message : '시작할 수 없습니다.')
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-app flex-col justify-center px-6 py-10">
      <h1 className="text-[28px] font-semibold tracking-tight">경조사 장부</h1>
      <p className="mt-2 text-[15px] text-muted">보낸 돈과 받은 돈을 사람별로 기록합니다.</p>

      {configured ? (
        <div className="mt-10 space-y-3">
          <Button className="w-full" onClick={onGoogle} disabled={pending}>
            Google로 계속
          </Button>
          <p className="pt-2 text-center text-[13px] text-muted">또는 이메일</p>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="block">
              <span className="mb-1 block text-[13px] text-muted">이메일</span>
              <input
                type="email"
                className="h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-ink"
                {...form.register('email')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] text-muted">비밀번호</span>
              <input
                type="password"
                className="h-11 w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-ink"
                {...form.register('password')}
              />
            </label>
            {form.formState.errors.email ? (
              <p className="text-[13px] text-red-700">{form.formState.errors.email.message}</p>
            ) : null}
            {form.formState.errors.password ? (
              <p className="text-[13px] text-red-700">{form.formState.errors.password.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {mode === 'signin' ? '로그인' : '회원가입'}
            </Button>
          </form>
          <button
            type="button"
            className="w-full py-2 text-[14px] text-muted hover:text-ink"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? '계정이 없으면 회원가입' : '이미 계정이 있으면 로그인'}
          </button>
        </div>
      ) : (
        <div className="mt-10">
          <Button className="w-full" onClick={onLocal}>
            시작하기
          </Button>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            Firebase 키가 없어 이 기기에만 저장합니다. `.env`에 `VITE_FIREBASE_*`를 넣으면
            계정 동기화가 켜집니다.
          </p>
        </div>
      )}

      {error ? <p className="mt-4 text-[13px] text-red-700">{error}</p> : null}
    </div>
  )
}
