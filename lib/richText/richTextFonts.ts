/**
 * Font configuration for the RichTextField editor.
 *
 * To add a new font:
 *  1. Add an entry to EDITOR_FONTS below.
 *  2. If it is a Google Font, add its `googleFontUrl` — Next.js layout will inject it as a <link>.
 *
 * `value`         — exact CSS font-family string applied to the editor content.
 * `label`         — display name shown in the toolbar font picker.
 * `script`        — writing system this font primarily targets.
 * `googleFontUrl` — Google Fonts stylesheet URL (optional). Loaded via <link> in layout.tsx.
 * `previewText`   — sample text shown in the dropdown to preview the font.
 */

export type EditorFont = {
  value: string;
  label: string;
  script: 'latin' | 'devanagari' | 'both';
  googleFontUrl?: string;
  previewText?: string;
};

export const EDITOR_FONTS: readonly EditorFont[] = [
  // ── Latin / default ──────────────────────────────────────────────────────
  {
    value: 'var(--font-geist-sans), sans-serif',
    label: 'Default',
    script: 'latin',
    previewText: 'The quick brown fox',
  },
  {
    value: "'Noto Sans', sans-serif",
    label: 'Noto Sans',
    script: 'latin',
    googleFontUrl:
      'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600&display=swap',
    previewText: 'The quick brown fox',
  },
  // ── Devanagari (Hindi) ───────────────────────────────────────────────────
  {
    value: "'Noto Sans Devanagari', sans-serif",
    label: 'Noto Sans Devanagari',
    script: 'devanagari',
    googleFontUrl:
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600&display=swap',
    previewText: 'नमस्ते दुनिया',
  },
  {
    value: "'Hind', sans-serif",
    label: 'Hind',
    script: 'devanagari',
    googleFontUrl:
      'https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600&display=swap',
    previewText: 'नमस्ते दुनिया',
  },
  {
    value: "'Baloo 2', sans-serif",
    label: 'Baloo 2',
    script: 'devanagari',
    googleFontUrl:
      'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600&display=swap',
    previewText: 'नमस्ते दुनिया',
  },
] as const;

/** The font used when no explicit font is selected. */
export const EDITOR_FONT_DEFAULT = EDITOR_FONTS[0];

/** All Google Font URLs that need to be preloaded (deduplicated). */
export const EDITOR_GOOGLE_FONT_URLS: readonly string[] = EDITOR_FONTS
  .map((f) => f.googleFontUrl)
  .filter((url): url is string => !!url);
