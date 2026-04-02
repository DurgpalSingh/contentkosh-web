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
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden w-full">
      {guard.needsUserGesture && (
        <div className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm shrink-0 shadow-sm">
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Fullscreen is recommended for this attempt.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => void guard.requestFullscreen()}>
              Enter fullscreen
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col w-full min-h-0 min-w-0 mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
        {children}
      </div>

      <AttemptExitConfirmModal
        isOpen={guard.isExitPromptOpen}
        onClose={guard.closeExitPrompt}
        onExitAttempt={exitAttempt}
        onContinueFullscreen={() => void guard.requestFullscreen()}
      />
    </div>
  );
}
