'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAttemptFullscreenGuard } from '@/lib/tests/attempt/useAttemptFullscreenGuard';
import { AttemptExitConfirmModal } from '@/components/dashboard/tests/student/AttemptExitConfirmModal';
import { studentTestBasePath } from '@/lib/tests/studentTestCatalog';

export default function StudentMyTestAttemptLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const guard = useAttemptFullscreenGuard({ enabled: true });

  const exitAttempt = useCallback(() => {
    router.push(studentTestBasePath(slug));
  }, [router, slug]);

  return (
    <div className="min-h-screen bg-slate-50">
      {guard.needsUserGesture && (
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-700">
              Fullscreen is recommended for this attempt.
            </p>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => void guard.requestFullscreen()}>
              Enter fullscreen
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">{children}</div>

      <AttemptExitConfirmModal
        isOpen={guard.isExitPromptOpen}
        onClose={guard.closeExitPrompt}
        onExitAttempt={exitAttempt}
        onContinueFullscreen={() => void guard.requestFullscreen()}
      />
    </div>
  );
}

