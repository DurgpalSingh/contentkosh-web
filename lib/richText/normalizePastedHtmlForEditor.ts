/**
 * Normalizes HTML pasted from Word or Google Docs so TipTap can parse tables and blocks reliably.
 * Strips Office conditional comments, empty Office paragraph tags, and non-content head noise.
 */
export function normalizePastedHtmlForEditor(html: string): string {
  if (typeof window === 'undefined' || !html.trim()) {
    return html;
  }

  const working = html
    .replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<!--StartFragment-->/gi, '')
    .replace(/<!--EndFragment-->/gi, '')
    .replace(/<o:p[^>]*>\s*<\/o:p>/gi, '')
    .replace(/<o:p[^>]*\/>/gi, '');

  try {
    const parser = new DOMParser();
    const isFullDoc = /^\s*<(!DOCTYPE|html)/i.test(working);
    const doc = isFullDoc
      ? parser.parseFromString(working, 'text/html')
      : parser.parseFromString(`<div id="ck-paste-wrap">${working}</div>`, 'text/html');

    const root: HTMLElement | null = isFullDoc ? doc.body : doc.getElementById('ck-paste-wrap');
    if (!root) {
      return working;
    }

    root.querySelectorAll('style, meta, link, script, title').forEach((el) => {
      el.remove();
    });

    root.querySelectorAll('[class*="msocom"]').forEach((el) => {
      el.remove();
    });

    return root.innerHTML;
  } catch {
    return working;
  }
}
