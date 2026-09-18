import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { entrySchema, type EntryFormValues } from '@/features/entries/schema'
import { ledgerKey, useLedger } from '@/features/ledger/use-ledger'
import { repo } from '@/shared/lib/data'
import { formatWon, normalizeName, parseDigits, todayIso } from '@/shared/lib/format'
import { AMOUNT_CHIPS, EVENT_LABELS, RELATION_LABELS } from '@/shared/lib/labels'
import { useUiStore } from '@/shared/stores/ui-store'
import { Button } from '@/shared/ui/Button'
import { ChipGroup } from '@/shared/ui/ChipGroup'
import { Segmented } from '@/shared/ui/Segmented'
import { EVENT_TYPES, RELATIONS } from '@/types/models'

export function EntryForm() {
  const open = useUiStore((s) => s.formOpen)
  const editingId = useUiStore((s) => s.editingId)
  const closeForm = useUiStore((s) => s.closeForm)
  const showToast = useUiStore((s) => s.showToast)
  const { user } = useAuth()
  const { people, entries } = useLedger()
  const queryClient = useQueryClient()
  const [nameFocus, setNameFocus] = useState(false)
  const [directAmount, setDirectAmount] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)

  const editing = entries.find((e) => e.id === editingId)

  function focusAmountInput() {
    window.requestAnimationFrame(() => {
      amountInputRef.current?.focus()
      amountInputRef.current?.select()
    })
  }

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      direction: 'given',
      amount: 0,
      personName: '',
      eventType: 'wedding',
      relation: 'friend',
      date: todayIso(),
      memo: '',
    },
  })

  useEffect(() => {
    if (!open) return
    if (editing) {
      form.reset({
        direction: editing.direction,
        amount: editing.amount,
        personName: editing.personName,
        eventType: editing.eventType,
        relation: editing.relation,
        date: editing.date,
        memo: editing.memo,
      })
      setDirectAmount(!AMOUNT_CHIPS.includes(editing.amount))
    } else {
      form.reset({
        direction: 'given',
        amount: 0,
        personName: '',
        eventType: 'wedding',
        relation: 'friend',
        date: todayIso(),
        memo: '',
      })
      setDirectAmount(false)
    }
  }, [open, editing, form])

  const personName = form.watch('personName')
  const suggestions = useMemo(() => {
    const q = normalizeName(personName).toLowerCase()
    if (!q) return people.slice(0, 6)
    return people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [people, personName])

  const save = useMutation({
    mutationFn: async (values: EntryFormValues) => {
      if (!user) throw new Error('로그인이 필요합니다.')
      await repo.saveEntry(
        user.uid,
        {
          ...values,
          personName: normalizeName(values.personName),
        },
        editingId ?? undefined,
      )
    },
    onSuccess: async () => {
      if (user) await queryClient.invalidateQueries({ queryKey: ledgerKey(user.uid) })
      showToast('저장됨')
      if (editingId) closeForm()
      else {
        form.reset({
          direction: form.getValues('direction'),
          amount: 0,
          personName: '',
          eventType: form.getValues('eventType'),
          relation: form.getValues('relation'),
          date: todayIso(),
          memo: '',
        })
        setDirectAmount(false)
      }
    },
  })

  const remove = useMutation({
    mutationFn: async () => {
      if (!user || !editingId) return
      await repo.deleteEntry(user.uid, editingId)
    },
    onSuccess: async () => {
      if (user) await queryClient.invalidateQueries({ queryKey: ledgerKey(user.uid) })
      showToast('삭제됨')
      closeForm()
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 bg-paper">
      <div className="mx-auto flex h-full w-full max-w-app flex-col">
        <header className="flex h-14 items-center justify-between border-b border-line px-3">
          <button
            type="button"
            onClick={closeForm}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-black/5"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
          <h1 className="text-[16px] font-medium">{editingId ? '내역 수정' : '내역 추가'}</h1>
          <button
            type="button"
            className="h-10 px-3 text-[15px] font-medium text-brand disabled:opacity-40"
            disabled={save.isPending}
            onClick={form.handleSubmit((v) => save.mutate(v))}
          >
            저장
          </button>
        </header>

        <form
          className="flex-1 overflow-y-auto px-4 py-4 pb-8"
          onSubmit={form.handleSubmit((v) => save.mutate(v))}
        >
          <Controller
            control={form.control}
            name="direction"
            render={({ field }) => (
              <Segmented
                ariaLabel="구분"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'given', label: '보낸' },
                  { value: 'received', label: '받은' },
                ]}
              />
            )}
          />

          <div className="mt-6">
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <input
                  ref={(el) => {
                    field.ref(el)
                    amountInputRef.current = el
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  aria-label="금액"
                  placeholder="0원"
                  className="tabular w-full border-0 border-b border-line bg-transparent pb-2 text-center text-[40px] font-semibold leading-none tracking-tight text-ink outline-none placeholder:text-ink/30 focus:border-ink"
                  value={field.value ? formatWon(field.value) : ''}
                  onFocus={() => setDirectAmount(true)}
                  onChange={(e) => {
                    setDirectAmount(true)
                    field.onChange(parseDigits(e.target.value))
                  }}
                />
              )}
            />
            {form.formState.errors.amount ? (
              <p className="mt-2 text-center text-[13px] text-red-700">
                {form.formState.errors.amount.message}
              </p>
            ) : null}
            <div className="mt-4">
              <ChipGroup
                ariaLabel="빠른 금액"
                value={directAmount ? 'custom' : form.watch('amount')}
                onChange={(v) => {
                  if (v === 'custom') {
                    setDirectAmount(true)
                    focusAmountInput()
                    return
                  }
                  setDirectAmount(false)
                  form.setValue('amount', v, { shouldValidate: true })
                }}
                options={[
                  ...AMOUNT_CHIPS.map((n) => ({
                    value: n,
                    label: `${(n / 10_000).toLocaleString('ko-KR')}만`,
                  })),
                  { value: 'custom', label: '직접입력' },
                ]}
              />
            </div>
          </div>

          <label className="mt-8 block">
            <span className="mb-1.5 block text-[13px] text-muted">이름</span>
            <input
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink"
              placeholder="상대 이름"
              {...form.register('personName')}
              onFocus={() => setNameFocus(true)}
              onBlur={() => window.setTimeout(() => setNameFocus(false), 120)}
            />
            {form.formState.errors.personName ? (
              <span className="mt-1 block text-[13px] text-red-700">
                {form.formState.errors.personName.message}
              </span>
            ) : null}
          </label>
          {nameFocus && suggestions.length > 0 ? (
            <ul className="mt-1 overflow-hidden rounded-lg border border-line bg-white">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[14px] hover:bg-black/[0.03]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      form.setValue('personName', p.name, { shouldValidate: true })
                      form.setValue('relation', p.relation)
                      setNameFocus(false)
                    }}
                  >
                    <span>{p.name}</span>
                    <span className="text-muted">{RELATION_LABELS[p.relation]}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6">
            <p className="mb-1.5 text-[13px] text-muted">종류</p>
            <Controller
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <ChipGroup
                  ariaLabel="종류"
                  value={field.value}
                  onChange={field.onChange}
                  options={EVENT_TYPES.map((v) => ({ value: v, label: EVENT_LABELS[v] }))}
                />
              )}
            />
          </div>

          <div className="mt-5">
            <p className="mb-1.5 text-[13px] text-muted">관계</p>
            <Controller
              control={form.control}
              name="relation"
              render={({ field }) => (
                <ChipGroup
                  ariaLabel="관계"
                  value={field.value}
                  onChange={field.onChange}
                  options={RELATIONS.map((v) => ({ value: v, label: RELATION_LABELS[v] }))}
                />
              )}
            />
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-[13px] text-muted">날짜</span>
            <input
              type="date"
              className="h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink"
              {...form.register('date')}
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-[13px] text-muted">메모</span>
            <input
              className="h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink"
              placeholder="선택"
              {...form.register('memo')}
            />
          </label>

          {save.error ? (
            <p className="mt-4 text-[13px] text-red-700">{save.error.message}</p>
          ) : null}

          {editingId ? (
            <Button
              variant="danger"
              className="mt-8 w-full"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm('이 내역을 삭제할까요?')) remove.mutate()
              }}
            >
              삭제
            </Button>
          ) : (
            <Button type="submit" className="mt-8 w-full" disabled={save.isPending}>
              저장하고 계속
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
