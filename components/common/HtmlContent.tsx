'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { QUIll_HTML_DOM_PURIFY_CONFIG } from '@/lib/config/quillHtmlDomPurifyConfig';
import { enrichSanitizedHtmlWithKatex } from '@/lib/richText/enrichHtmlWithKatex';
import { cn } from '@/lib/utils';

import 'katex/dist/katex.min.css';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function HtmlContent({
  html,
  className,
}: {
  html: string | null | undefined;
  /** Extra classes (e.g. from layout). Base styles come from `globals.css` `.html-content`. */
  className?: string;
}) {
  const sanitizedHtml = useMemo(() => {
    const input = html ?? '';
    return DOMPurify.sanitize(input, QUIll_HTML_DOM_PURIFY_CONFIG);
  }, [html]);

  const displayHtml = useMemo(() => {
    if (!sanitizedHtml) return '';
    if (!isBrowser()) return sanitizedHtml;
    return enrichSanitizedHtmlWithKatex(sanitizedHtml);
  }, [sanitizedHtml]);

  if (!sanitizedHtml) return null;

  return (
    <div
      className={cn('html-content max-w-full overflow-x-auto', className)}
      dangerouslySetInnerHTML={{ __html: displayHtml }}
      // Server HTML is sanitized-only; client adds KaTeX in the same pass (no empty-math flash).
      suppressHydrationWarning
    />
  );
}
