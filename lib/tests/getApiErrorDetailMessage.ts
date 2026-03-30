import { ApiError } from '@/lib/api'

/** Prefer server JSON `message` over generic status text (e.g. "Invalid input data"). */
export const getApiErrorDetailMessage = (err: unknown, fallback: string): string => {
  if (err instanceof ApiError) {
    const body = err.body
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message?: unknown }).message
      if (typeof m === 'string' && m.trim()) return m
    }
    if (err.message && err.message !== 'Bad Request' && err.message !== 'Invalid input data') {
      return err.message
    }
    return fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}
