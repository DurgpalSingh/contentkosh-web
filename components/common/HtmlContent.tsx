'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

const quillAllowedTags = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'ol',
  'ul',
  'li',
  'a',
  'span',
];

const quillAllowedAttributes: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  span: ['class'],
  p: ['class'],
};

export function HtmlContent({ html }: { html: string | null | undefined }) {
  const sanitizedHtml = useMemo(() => {
    const input = html ?? '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: quillAllowedTags,
      ALLOWED_ATTR: quillAllowedAttributes,
      ALLOWED_URI_REGEXP: /^(?:(?:https?):|[^a-z]|[a-z]|[A-Z]|[0-9]|[$_.+!*'(),]|(?:%[0-9a-fA-F]{2}))+/,
    });
  }, [html]);

  if (!sanitizedHtml) return null;

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

