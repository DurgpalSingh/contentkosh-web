/**
 * DOMPurify allowlists for rendering rich HTML (Quill/TipTap + math) in `HtmlContent`.
 * Keep tags and per-tag attributes aligned with
 * `contentkosh-backend/src/config/quillSanitizeConfig.ts`.
 */
import type { Config } from 'dompurify';

export const QUIll_DOM_PURIFY_ALLOWED_TAGS = [
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
  'div',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
] as const;

/** Same shape as backend `QUIll_SANITIZE_ALLOWED_ATTRIBUTES` (DOMPurify uses a flat `ALLOWED_ATTR` union). */
export const QUIll_DOM_PURIFY_ALLOWED_ATTRIBUTES_BY_TAG: Readonly<Record<string, readonly string[]>> = {
  a: ['href', 'target', 'rel'],
  span: ['class', 'data-type', 'data-latex'],
  p: ['class'],
  div: ['class', 'data-type', 'data-latex'],
  table: ['class', 'style', 'width'],
  thead: ['class'],
  tbody: ['class'],
  tfoot: ['class'],
  tr: ['class'],
  th: ['class', 'style', 'colspan', 'rowspan', 'align', 'colwidth', 'width'],
  td: ['class', 'style', 'colspan', 'rowspan', 'align', 'colwidth', 'width'],
  caption: ['class'],
  colgroup: ['class', 'span', 'width'],
  col: ['class', 'span', 'width'],
} as const;

/** Global attribute allowlist required by DOMPurify (union of per-tag attrs above). */
export const QUIll_DOM_PURIFY_ALLOWED_ATTR: string[] = Array.from(
  new Set(Object.values(QUIll_DOM_PURIFY_ALLOWED_ATTRIBUTES_BY_TAG).flat()),
);

/** Default DOMPurify URI checker, restricted toward http(s)-style safe URLs. */
export const QUIll_DOM_PURIFY_ALLOWED_URI_REGEXP =
  /^(?:(?:https?):|[^a-z]|[a-z]|[A-Z]|[0-9]|[$_.+!*'(),]|(?:%[0-9a-fA-F]{2}))+/;

export const QUIll_HTML_DOM_PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [...QUIll_DOM_PURIFY_ALLOWED_TAGS],
  ALLOWED_ATTR: QUIll_DOM_PURIFY_ALLOWED_ATTR,
  ALLOWED_URI_REGEXP: QUIll_DOM_PURIFY_ALLOWED_URI_REGEXP,
};
