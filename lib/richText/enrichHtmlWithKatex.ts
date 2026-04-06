import katex from 'katex';
import { TIPTAP_KATEX_OPTIONS } from '@/lib/richText/richTextConstants';

/**
 * After DOMPurify, replace TipTap math placeholders (`data-type` + `data-latex`)
 * with KaTeX HTML. Runs only in the browser; keeps output deterministic (no post-render DOM races).
 */
export function enrichSanitizedHtmlWithKatex(sanitizedHtml: string): string {
  if (typeof document === 'undefined' || !sanitizedHtml.trim()) {
    return sanitizedHtml;
  }

  const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
  const { body } = doc;

  body.querySelectorAll<HTMLElement>('span[data-type="inline-math"]').forEach((el) => {
    const latex = el.getAttribute('data-latex');
    if (latex === null || latex === '') return;
    try {
      el.innerHTML = katex.renderToString(latex, {
        ...TIPTAP_KATEX_OPTIONS,
        displayMode: false,
      });
    } catch {
      el.textContent = latex;
    }
  });

  body.querySelectorAll<HTMLElement>('div[data-type="block-math"]').forEach((el) => {
    const latex = el.getAttribute('data-latex');
    if (latex === null || latex === '') return;
    try {
      el.innerHTML = katex.renderToString(latex, {
        ...TIPTAP_KATEX_OPTIONS,
        displayMode: true,
      });
    } catch {
      el.textContent = latex;
    }
  });

  return body.innerHTML;
}
