import type { KatexOptions } from 'katex'

/** Shared KaTeX options for TipTap Mathematics and any preview UI. */
export const TIPTAP_KATEX_OPTIONS: KatexOptions = {
  throwOnError: false,
  macros: {
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\Q': '\\mathbb{Q}',
  },
}

/** Non-empty placeholder so TipTap math insert commands accept the transaction. */
export const MATH_INSERT_PLACEHOLDER_LATEX = '\\,' as const

/** Must match `@tiptap/extension-mathematics` node names. */
export const TIPTAP_INLINE_MATH_NODE_NAME = 'inlineMath' as const;
export const TIPTAP_BLOCK_MATH_NODE_NAME = 'blockMath' as const;

/**
 * Hover (`title`) copy for the TipTap rich text toolbar — keep in sync with RichTextField actions.
 */
export const RICH_TEXT_TOOLTIP = {
  styleSelect: 'Paragraph or heading level for this line',
  bold: 'Bold — emphasize text',
  italic: 'Italic — slanted text',
  underline: 'Underline',
  strike: 'Strikethrough',
  blockquote: 'Block quote',
  bulletList: 'Bulleted list',
  orderedList: 'Numbered list',
  link: 'Add or edit a web link (select text first, then paste URL)',
  undo: 'Undo last change',
  redo: 'Redo',
  mathPalette: 'Insert equations and math symbols (LaTeX)',
  mathInsertInline: 'Insert inline equation — click to edit LaTeX',
  mathInsertBlock: 'Insert centered block equation — click to edit LaTeX',
  clear: 'Clear all content in this field',
  linkUrlField: 'Full web address, starting with https://',
} as const

