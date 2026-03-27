'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AttemptFullscreenGuardState = {
  isFullscreen: boolean;
  isExitPromptOpen: boolean;
  needsUserGesture: boolean;
  requestFullscreen: () => Promise<void>;
  closeExitPrompt: () => void;
  openExitPrompt: () => void;
};

export function useAttemptFullscreenGuard(params: {
  enabled: boolean;
}): AttemptFullscreenGuardState {
  const { enabled } = params;
  const [isExitPromptOpen, setIsExitPromptOpen] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const mountedRef = useRef(false);

  const isFullscreen = useMemo(() => {
    if (typeof document === 'undefined') return false;
    return !!document.fullscreenElement;
  }, []);

  const requestFullscreen = useCallback(async () => {
    if (!enabled) return;
    if (typeof document === 'undefined') return;
    try {
      if (document.fullscreenElement) return;
      await document.documentElement.requestFullscreen();
      setNeedsUserGesture(false);
      setIsExitPromptOpen(false);
    } catch {
      setNeedsUserGesture(true);
    }
  }, [enabled]);

  const openExitPrompt = useCallback(() => {
    if (!enabled) return;
    setIsExitPromptOpen(true);
  }, [enabled]);

  const closeExitPrompt = useCallback(() => setIsExitPromptOpen(false), []);

  useEffect(() => {
    if (!enabled) return;
    if (mountedRef.current) return;
    mountedRef.current = true;
    void requestFullscreen();
  }, [enabled, requestFullscreen]);

  useEffect(() => {
    if (!enabled) return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsExitPromptOpen(true);
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [enabled]);

  return {
    isFullscreen,
    isExitPromptOpen,
    needsUserGesture,
    requestFullscreen,
    closeExitPrompt,
    openExitPrompt,
  };
}

