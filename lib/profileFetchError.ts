import { ApiError } from '@/lib/api/core/ApiError';

type ResolveProfileFetchErrorParams = {
  err: unknown;
  fallbackMessage: string;
  notFoundMessage: string;
  suppressNotFoundError: boolean;
};

export function resolveProfileFetchError({
  err,
  fallbackMessage,
  notFoundMessage,
  suppressNotFoundError,
}: ResolveProfileFetchErrorParams): string | null {
  if (!(err instanceof ApiError)) {
    return fallbackMessage;
  }

  const statusMessageMap: Record<number, string | null> = {
    404: suppressNotFoundError ? null : notFoundMessage,
  };

  if (err.status in statusMessageMap) {
    return statusMessageMap[err.status];
  }

  return err.body?.message ?? fallbackMessage;
}