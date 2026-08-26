const ACTION_PHRASES: Record<string, string> = {
  paused: 'is on hold by administrator',
  removed: 'has been removed by administrator',
};

export const MESSAGES = {
  businessSuspended: (action?: string | null, reason?: string | null): string => {
    const phrase = (action && ACTION_PHRASES[action]) || ACTION_PHRASES.paused;
    const trimmedReason = reason?.trim();
    return trimmedReason
      ? `This business access ${phrase} with reason: ${trimmedReason}`
      : `This business access ${phrase}.`;
  },
};
