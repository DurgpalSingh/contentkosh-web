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

<<<<<<< HEAD
=======
  // If we have an explicit mapping for this status code, return it (even if it's null)
>>>>>>> 075ace5 (implimented profile settings feature)
  if (err.status in statusMessageMap) {
    return statusMessageMap[err.status];
  }

  return err.body?.message ?? fallbackMessage;
<<<<<<< HEAD
}
=======
}
>>>>>>> 075ace5 (implimented profile settings feature)
