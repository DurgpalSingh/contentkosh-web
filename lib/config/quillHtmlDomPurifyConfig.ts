/**
 * DOMPurify allowlists for rendering Quill/rich HTML (e.g. `HtmlContent`).
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
] as const;

/** Same shape as backend `QUIll_SANITIZE_ALLOWED_ATTRIBUTES` (for documentation parity; DOMPurify uses a flat `ALLOWED_ATTR`). */
export const QUIll_DOM_PURIFY_ALLOWED_ATTRIBUTES_BY_TAG: Readonly<Record<string, readonly string[]>> = {
  a: ['href', 'target', 'rel'],
  span: ['class'],
  p: ['class'],
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
