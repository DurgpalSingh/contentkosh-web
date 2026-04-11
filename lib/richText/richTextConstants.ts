/**
 * Single module for rich-text (TipTap / KaTeX) constants: KaTeX options, node names,
 * toolbar copy, table insert limits, and math palette data.
 */

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
  tableInsert: 'Insert a table — choose rows and columns',
  tableHeaderRow: 'Use first row as header',
  tableAddRowBefore: 'Insert row above',
  tableAddRowAfter: 'Insert row below',
  tableDeleteRow: 'Delete this row',
  tableAddColumnBefore: 'Insert column left',
  tableAddColumnAfter: 'Insert column right',
  tableDeleteColumn: 'Delete this column',
  tableToggleHeaderRow: 'Toggle header row',
  tableDelete: 'Delete entire table',
} as const

export type MathPaletteSnippet = {
  label: string;
  latex: string;
};

export type MathPaletteCategory = {
  id: string;
  /** Short heading shown in the UI */
  label: string;
  /** Explains what kind of symbols are in this group */
  description: string;
  items: readonly MathPaletteSnippet[];
};

export const MATH_PALETTE_CATEGORIES: readonly MathPaletteCategory[] = [
  {
    id: 'greekLower',
    label: 'Greek (lowercase)',
    description: 'Common variable names in geometry, statistics, and physics',
    items: [
      { label: 'α', latex: '\\alpha' },
      { label: 'β', latex: '\\beta' },
      { label: 'γ', latex: '\\gamma' },
      { label: 'δ', latex: '\\delta' },
      { label: 'ε', latex: '\\varepsilon' },
      { label: 'ζ', latex: '\\zeta' },
      { label: 'η', latex: '\\eta' },
      { label: 'θ', latex: '\\theta' },
      { label: 'ι', latex: '\\iota' },
      { label: 'κ', latex: '\\kappa' },
      { label: 'λ', latex: '\\lambda' },
      { label: 'μ', latex: '\\mu' },
      { label: 'ν', latex: '\\nu' },
      { label: 'ξ', latex: '\\xi' },
      { label: 'π', latex: '\\pi' },
      { label: 'ρ', latex: '\\rho' },
      { label: 'σ', latex: '\\sigma' },
      { label: 'τ', latex: '\\tau' },
      { label: 'υ', latex: '\\upsilon' },
      { label: 'φ', latex: '\\phi' },
      { label: 'χ', latex: '\\chi' },
      { label: 'ψ', latex: '\\psi' },
      { label: 'ω', latex: '\\omega' },
    ],
  },
  {
    id: 'greekUpper',
    label: 'Greek (uppercase)',
    description: 'Summation-style capitals and common capitals in proofs',
    items: [
      { label: 'Γ', latex: '\\Gamma' },
      { label: 'Δ', latex: '\\Delta' },
      { label: 'Θ', latex: '\\Theta' },
      { label: 'Λ', latex: '\\Lambda' },
      { label: 'Ξ', latex: '\\Xi' },
      { label: 'Π', latex: '\\Pi' },
      { label: 'Σ', latex: '\\Sigma' },
      { label: 'Υ', latex: '\\Upsilon' },
      { label: 'Φ', latex: '\\Phi' },
      { label: 'Ψ', latex: '\\Psi' },
      { label: 'Ω', latex: '\\Omega' },
    ],
  },
  {
    id: 'arithmetic',
    label: 'Arithmetic & algebra',
    description: 'Fractions, roots, exponents, and basic operations',
    items: [
      { label: 'a⁄b', latex: '\\frac{a}{b}' },
      { label: '√', latex: '\\sqrt{x}' },
      { label: 'ⁿ√', latex: '\\sqrt[n]{x}' },
      { label: 'xⁿ', latex: 'x^{n}' },
      { label: 'xₙ', latex: 'x_{n}' },
      { label: '±', latex: '\\pm' },
      { label: '∓', latex: '\\mp' },
      { label: '×', latex: '\\times' },
      { label: '÷', latex: '\\div' },
      { label: '·', latex: '\\cdot' },
      { label: '…', latex: '\\cdots' },
      { label: 'mod', latex: '\\bmod' },
    ],
  },
  {
    id: 'relations',
    label: 'Relations & comparisons',
    description: 'Equalities, inequalities, and similarity',
    items: [
      { label: '=', latex: '=' },
      { label: '≠', latex: '\\neq' },
      { label: '≈', latex: '\\approx' },
      { label: '≡', latex: '\\equiv' },
      { label: '∝', latex: '\\propto' },
      { label: '<', latex: '<' },
      { label: '>', latex: '>' },
      { label: '≤', latex: '\\leq' },
      { label: '≥', latex: '\\geq' },
      { label: '≪', latex: '\\ll' },
      { label: '≫', latex: '\\gg' },
      { label: '∼', latex: '\\sim' },
      { label: '≃', latex: '\\simeq' },
      { label: '≅', latex: '\\cong' },
    ],
  },
  {
    id: 'arrows',
    label: 'Arrows & limits',
    description: 'Mappings, convergence, and logical implication',
    items: [
      { label: '→', latex: '\\rightarrow' },
      { label: '←', latex: '\\leftarrow' },
      { label: '↔', latex: '\\leftrightarrow' },
      { label: '⇒', latex: '\\Rightarrow' },
      { label: '⇐', latex: '\\Leftarrow' },
      { label: '⇔', latex: '\\Leftrightarrow' },
      { label: '↦', latex: '\\mapsto' },
      { label: '⟶', latex: '\\longrightarrow' },
      { label: '↑', latex: '\\uparrow' },
      { label: '↓', latex: '\\downarrow' },
    ],
  },
  {
    id: 'setsLogic',
    label: 'Sets, logic & number systems',
    description: 'Membership, connectives, and common sets',
    items: [
      { label: '∈', latex: '\\in' },
      { label: '∉', latex: '\\notin' },
      { label: '⊂', latex: '\\subset' },
      { label: '⊆', latex: '\\subseteq' },
      { label: '⊃', latex: '\\supset' },
      { label: '∪', latex: '\\cup' },
      { label: '∩', latex: '\\cap' },
      { label: '∅', latex: '\\emptyset' },
      { label: '∀', latex: '\\forall' },
      { label: '∃', latex: '\\exists' },
      { label: '∄', latex: '\\nexists' },
      { label: '∧', latex: '\\land' },
      { label: '∨', latex: '\\lor' },
      { label: '¬', latex: '\\neg' },
      { label: 'ℝ', latex: '\\mathbb{R}' },
      { label: 'ℕ', latex: '\\mathbb{N}' },
      { label: 'ℤ', latex: '\\mathbb{Z}' },
      { label: 'ℚ', latex: '\\mathbb{Q}' },
      { label: 'ℂ', latex: '\\mathbb{C}' },
    ],
  },
  {
    id: 'calculus',
    label: 'Calculus & analysis',
    description: 'Limits, derivatives, integrals, and series',
    items: [
      { label: 'lim', latex: '\\lim_{x \\to 0}' },
      { label: 'Σ', latex: '\\sum_{i=1}^{n}' },
      { label: '∏', latex: '\\prod_{i=1}^{n}' },
      { label: '∫', latex: '\\int_{a}^{b}' },
      { label: '∬', latex: '\\iint' },
      { label: '∭', latex: '\\iiint' },
      { label: '∮', latex: '\\oint' },
      { label: '∂', latex: '\\partial' },
      { label: '∇', latex: '\\nabla' },
      { label: '∞', latex: '\\infty' },
      { label: 'd/dx', latex: '\\frac{d}{dx}' },
      { label: '∂/∂x', latex: '\\frac{\\partial}{\\partial x}' },
    ],
  },
  {
    id: 'trigLog',
    label: 'Trigonometric & logarithmic',
    description: 'Standard functions (Roman names for proper spacing)',
    items: [
      { label: 'sin', latex: '\\sin x' },
      { label: 'cos', latex: '\\cos x' },
      { label: 'tan', latex: '\\tan x' },
      { label: 'cot', latex: '\\cot x' },
      { label: 'sec', latex: '\\sec x' },
      { label: 'csc', latex: '\\csc x' },
      { label: 'ln', latex: '\\ln x' },
      { label: 'log', latex: '\\log x' },
      { label: 'exp', latex: '\\exp x' },
    ],
  },
  {
    id: 'geometry',
    label: 'Geometry & angles',
    description: 'Angles, triangles, and parallelism',
    items: [
      { label: '∠', latex: '\\angle' },
      { label: '△', latex: '\\triangle' },
      { label: '⊥', latex: '\\perp' },
      { label: '∥', latex: '\\parallel' },
      { label: '°', latex: '^\\circ' },
    ],
  },
  {
    id: 'linearAlgebra',
    label: 'Linear algebra',
    description: 'Matrices and vectors (editable placeholders)',
    items: [
      { label: '[·]', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
      { label: '·⃗', latex: '\\vec{v}' },
      { label: '·̂', latex: '\\hat{i}' },
      { label: '⊗', latex: '\\otimes' },
      { label: '⊕', latex: '\\oplus' },
      { label: 'det', latex: '\\det A' },
      { label: 'tr', latex: '\\operatorname{tr}(A)' },
    ],
  },
] as const;

/** Defaults for “Insert table” in the rich text toolbar */
export const RICH_TEXT_TABLE_INSERT_ROWS_DEFAULT = 3 as const;
export const RICH_TEXT_TABLE_INSERT_COLS_DEFAULT = 3 as const;
export const RICH_TEXT_TABLE_INSERT_MIN = 1 as const;
export const RICH_TEXT_TABLE_INSERT_MAX = 20 as const;
