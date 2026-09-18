import { z } from 'zod'
import { DIRECTIONS, EVENT_TYPES, RELATIONS } from '@/types/models'

export const entrySchema = z.object({
  direction: z.enum(DIRECTIONS),
  amount: z
    .number()
    .int('금액은 정수여야 합니다.')
    .positive('금액을 입력하세요.')
    .max(100_000_000, '1억 이하로 입력하세요.'),
  personName: z.string().trim().min(1, '이름을 입력하세요.').max(40),
  eventType: z.enum(EVENT_TYPES),
  relation: z.enum(RELATIONS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 확인하세요.'),
  memo: z.string().max(200),
})

export type EntryFormValues = z.infer<typeof entrySchema>
