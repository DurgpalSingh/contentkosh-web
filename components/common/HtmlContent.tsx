'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { QUIll_HTML_DOM_PURIFY_CONFIG } from '@/lib/config/quillHtmlDomPurifyConfig';

export function HtmlContent({ html }: { html: string | null | undefined }) {
  const sanitizedHtml = useMemo(() => {
    const input = html ?? '';
    return DOMPurify.sanitize(input, QUIll_HTML_DOM_PURIFY_CONFIG);
  }, [html]);

  if (!sanitizedHtml) return null;

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
