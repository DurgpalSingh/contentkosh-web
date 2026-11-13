'use client';

import { useEffect, useRef } from 'react';

type DocxPreviewProps = {
  blob: Blob;
  onReady: () => void;
  onError: () => void;
};

export function DocxPreview({ blob, onReady, onError }: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    const renderDocx = async () => {
      if (!container) return;

      container.replaceChildren();

      try {
        const { renderAsync } = await import('docx-preview');
        await renderAsync(await blob.arrayBuffer(), container, undefined, { useBase64URL: true });
        if (!cancelled) onReady();
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to render DOCX preview:', error);
        onError();
      }
    };

    void renderDocx();

    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [blob, onError, onReady]);

  return (
    <div className="docx-preview-container h-full overflow-auto bg-slate-100 p-4">
      <div ref={containerRef} />
    </div>
  );
}
