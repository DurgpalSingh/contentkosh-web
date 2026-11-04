'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/auth';
import { EMAIL_VERIFICATION } from '@/lib/constants';
import { EMAIL_VERIFICATION_MESSAGES } from '@/lib/messages';

const TICK_MS = 1000;

interface ResendVerificationButtonProps {
  email: string;
  /** Seconds to wait before the first resend, e.g. right after a mail was just sent. */
  initialCooldownSeconds?: number;
  disabled?: boolean;
}

export function ResendVerificationButton({
  email,
  initialCooldownSeconds = 0,
  disabled = false,
}: ResendVerificationButtonProps) {
  const [cooldown, setCooldown] = useState(initialCooldownSeconds);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), TICK_MS);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      await authApi.resendVerification(email.trim());
      setFeedback({ message: EMAIL_VERIFICATION_MESSAGES.RESEND_SUCCESS, isError: false });
      setCooldown(EMAIL_VERIFICATION.RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : EMAIL_VERIFICATION_MESSAGES.RESEND_FAILED,
        isError: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const label = isSending
    ? EMAIL_VERIFICATION_MESSAGES.RESEND_SENDING
    : cooldown > 0
      ? EMAIL_VERIFICATION_MESSAGES.RESEND_COOLDOWN(cooldown)
      : EMAIL_VERIFICATION_MESSAGES.RESEND_BUTTON;

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handleResend}
        disabled={disabled || isSending || cooldown > 0 || !email.trim()}
        className="w-full rounded-xl bg-slate-900 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </Button>
      {feedback && (
        <p className={`text-sm ${feedback.isError ? 'text-red-600' : 'text-emerald-700'}`} role="status">
          {feedback.message}
        </p>
      )}
    </div>
  );
}
