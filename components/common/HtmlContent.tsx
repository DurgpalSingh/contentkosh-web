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

/** Tailwind-only rich HTML (TipTap + KaTeX + tables) */
const htmlContentRichClassName = cn(
  'leading-relaxed text-foreground [overflow-wrap:anywhere]',
  '[&_p]:mb-3 [&_p:last-child]:mb-0',
  '[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-snug [&_h1]:my-3 [&_h1]:mb-2',
  '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-3 [&_h2]:mb-2',
  '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2 [&_h3]:mb-1.5',
  '[&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-muted-foreground',
  '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:my-2 [&_ol]:my-2 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:list-item',
  "[&_ol[type='i']]:list-[lower-roman]",
  '[&_ul_ul]:list-[circle]',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_table]:my-3 [&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:text-sm',
  '[&_thead]:bg-muted/40',
  '[&_th]:border [&_th]:border-border [&_th]:bg-muted/40 [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium',
  '[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-2 [&_td]:align-top',
  '[&_td_p]:mb-0 [&_th_p]:mb-0',
  '[&_[data-type=block-math]]:block [&_[data-type=block-math]]:my-3 [&_[data-type=block-math]]:max-w-full [&_[data-type=block-math]]:overflow-x-auto',
  '[&_.katex-display]:block [&_.katex-display]:my-3 [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto',
  '[&_[data-type=inline-math]]:max-w-full [&_.katex]:max-w-full',
  '[&_img]:max-w-full [&_img]:h-auto [&_img]:inline-block',
);

export function HtmlContent({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const sanitizedHtml = useMemo(() => {
    const input = html ?? '';
    return DOMPurify.sanitize(input, {
      ...QUIll_HTML_DOM_PURIFY_CONFIG,
      ADD_TAGS: ['img'],
      // Explicitly allow Base64 data URIs for images in the student view
      ADD_DATA_URI_TAGS: ['img'],
      // Ensure styles for alignment and resizing are preserved
      ADD_ATTR: ['src', 'style', 'width', 'height', 'alt', 'title'],
    });
  }, [html]);

  const displayHtml = useMemo(() => {
    if (!sanitizedHtml) return '';
    if (!isBrowser()) return sanitizedHtml;
    return enrichSanitizedHtmlWithKatex(sanitizedHtml);
  }, [sanitizedHtml]);

  if (!sanitizedHtml) return null;

  return (
    <div
      className={cn(htmlContentRichClassName, 'max-w-full overflow-x-auto', className)}
      dangerouslySetInnerHTML={{ __html: displayHtml }}
      suppressHydrationWarning
    />
  );
}
