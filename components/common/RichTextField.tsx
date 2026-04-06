'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mathematics from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import katex from 'katex';
import {
  Bold,
  Calculator,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
  Link2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MATH_PALETTE_CATEGORIES } from '@/lib/richText/mathPaletteConstants';
import {
  MATH_INSERT_PLACEHOLDER_LATEX,
  TIPTAP_BLOCK_MATH_NODE_NAME,
  TIPTAP_INLINE_MATH_NODE_NAME,
  TIPTAP_KATEX_OPTIONS,
} from '@/lib/richText/tiptapKatexConstants';
import { RICH_TEXT_TOOLTIP } from '@/lib/richText/tiptapKatexConstants';
import { cn } from '@/lib/utils';

import 'katex/dist/katex.min.css';

const HEADING_LEVELS = [1, 2, 3] as const;

/**
 * Toolbar buttons would otherwise take focus on mousedown, clearing the editor selection before click.
 * @see https://github.com/ueberdosis/tiptap/issues/475
 */
function preventToolbarMouseDownStealingFocus(e: MouseEvent) {
  e.preventDefault();
}

function toggleBulletListWithHeadingFallback(editor: Editor | null) {
  if (!editor) return;
  let chain = editor.chain().focus();
  if (editor.isActive('heading')) {
    chain = chain.setParagraph();
  }
  if (editor.isActive('blockquote')) {
    chain = chain.toggleBlockquote();
  }
  chain.toggleBulletList().run();
}

function toggleOrderedListWithHeadingFallback(editor: Editor | null) {
  if (!editor) return;
  let chain = editor.chain().focus();
  if (editor.isActive('heading')) {
    chain = chain.setParagraph();
  }
  if (editor.isActive('blockquote')) {
    chain = chain.toggleBlockquote();
  }
  chain.toggleOrderedList().run();
}

type MathEditState = {
  mode: 'inline' | 'block';
  pos: number;
  latex: string;
};

function MathPreview({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex || '\\,', {
        ...TIPTAP_KATEX_OPTIONS,
        displayMode: false,
      });
    } catch {
      return '<span class="text-red-600 text-sm">Invalid LaTeX</span>';
    }
  }, [latex]);
  return (
    <div
      className="min-h-[2rem] rounded border bg-slate-50 px-2 py-1 text-sm overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function RichTextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [mathEdit, setMathEdit] = useState<MathEditState | null>(null);
  const [mathDraft, setMathDraft] = useState('');
  /** Captured when opening link popover so Apply can run after focus moves to the URL field */
  const linkSelectionRef = useRef<{ from: number; to: number } | null>(null);
  /** Captured when opening the math palette so symbol inserts work after the editor blurs */
  const mathPaletteSelectionRef = useRef<{ from: number; to: number } | null>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      Mathematics.configure({
        katexOptions: TIPTAP_KATEX_OPTIONS,
        inlineOptions: {
          onClick: (node, pos) => {
            setMathEdit({ mode: 'inline', pos, latex: String(node.attrs.latex ?? '') });
            setMathDraft(String(node.attrs.latex ?? ''));
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            setMathEdit({ mode: 'block', pos, latex: String(node.attrs.latex ?? '') });
            setMathDraft(String(node.attrs.latex ?? ''));
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    immediatelyRender: false,
    /** Required so toolbar active states and Undo/Redo reflect selection and doc changes */
    shouldRerenderOnTransaction: true,
    extensions,
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'rich-text-field-editor prose prose-sm max-w-none min-h-[140px] px-3 py-2 focus:outline-none',
        ),
        'aria-label': ariaLabel ?? 'Rich text',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (mathEdit) {
      setMathDraft(mathEdit.latex);
    }
  }, [mathEdit]);

  const insertInlineEquation = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: TIPTAP_INLINE_MATH_NODE_NAME,
        attrs: { latex: MATH_INSERT_PLACEHOLDER_LATEX },
      })
      .run();
  }, [editor]);

  const insertBlockEquation = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: TIPTAP_BLOCK_MATH_NODE_NAME,
        attrs: { latex: MATH_INSERT_PLACEHOLDER_LATEX },
      })
      .run();
  }, [editor]);

  const insertLatexSnippet = useCallback(
    (latex: string) => {
      if (!editor) return;
      const saved = mathPaletteSelectionRef.current;
      if (saved) {
        editor
          .chain()
          .focus()
          .insertContentAt(
            { from: saved.from, to: saved.to },
            { type: TIPTAP_INLINE_MATH_NODE_NAME, attrs: { latex } },
          )
          .run();
        mathPaletteSelectionRef.current = null;
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent({ type: TIPTAP_INLINE_MATH_NODE_NAME, attrs: { latex } })
        .run();
    },
    [editor],
  );

  const applyLink = useCallback(() => {
    if (!editor) return;
    const saved = linkSelectionRef.current;
    let chain = editor.chain().focus();
    if (saved) {
      chain = chain.setTextSelection({ from: saved.from, to: saved.to });
    }
    const url = linkUrl.trim();
    if (url.length === 0) {
      chain.unsetLink().run();
    } else {
      chain.toggleLink({ href: url }).run();
    }
    linkSelectionRef.current = null;
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const applyMathEdit = useCallback(() => {
    if (!editor || !mathEdit) return;
    const latex = mathDraft.trim().length > 0 ? mathDraft.trim() : MATH_INSERT_PLACEHOLDER_LATEX;
    if (mathEdit.mode === 'inline') {
      editor.chain().focus().updateInlineMath({ latex, pos: mathEdit.pos }).run();
    } else {
      editor.chain().focus().updateBlockMath({ latex, pos: mathEdit.pos }).run();
    }
    setMathEdit(null);
  }, [editor, mathDraft, mathEdit]);

  const cancelMathEdit = useCallback(() => {
    setMathEdit(null);
  }, []);

  if (!editor) {
    return (
      <div
        className="rounded-md border border-slate-200 bg-slate-50 min-h-[180px]"
        aria-hidden
      />
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden" aria-label={ariaLabel}>
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
        <select
          className="h-8 rounded border border-slate-200 bg-white px-1 text-xs max-w-[7rem]"
          title={RICH_TEXT_TOOLTIP.styleSelect}
          aria-label={RICH_TEXT_TOOLTIP.styleSelect}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = Number(v) as 1 | 2 | 3;
              editor.chain().focus().setHeading({ level }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 })
              ? '1'
              : editor.isActive('heading', { level: 2 })
                ? '2'
                : editor.isActive('heading', { level: 3 })
                  ? '3'
                  : 'paragraph'
          }
        >
          <option value="paragraph">Paragraph</option>
          {HEADING_LEVELS.map((l) => (
            <option key={l} value={String(l)}>
              Heading {l}
            </option>
          ))}
        </select>

        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.bold}
          pressed={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.italic}
          pressed={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.underline}
          pressed={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.strike}
          pressed={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.blockquote}
          pressed={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.bulletList}
          pressed={editor.isActive('bulletList')}
          onClick={() => toggleBulletListWithHeadingFallback(editor)}
        >
          <List className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.orderedList}
          pressed={editor.isActive('orderedList')}
          onClick={() => toggleOrderedListWithHeadingFallback(editor)}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarIconButton>

        <Popover
          open={linkOpen}
          onOpenChange={(open) => {
            setLinkOpen(open);
            if (open && editor) {
              const prev = editor.getAttributes('link').href;
              setLinkUrl(typeof prev === 'string' ? prev : '');
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={editor.isActive('link') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              title={RICH_TEXT_TOOLTIP.link}
              aria-label={RICH_TEXT_TOOLTIP.link}
              aria-pressed={editor.isActive('link')}
              onMouseDown={preventToolbarMouseDownStealingFocus}
              onPointerDownCapture={() => {
                if (!editor) return;
                const sel = editor.state.selection;
                linkSelectionRef.current = { from: sel.from, to: sel.to };
              }}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-2">
              <Label htmlFor="rich-text-link-url">URL</Label>
              <Input
                id="rich-text-link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                title={RICH_TEXT_TOOLTIP.linkUrlField}
                placeholder="https://"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setLinkOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyLink}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.undo}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          tooltip={RICH_TEXT_TOOLTIP.redo}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarIconButton>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs font-medium"
              title={RICH_TEXT_TOOLTIP.mathPalette}
              aria-label={RICH_TEXT_TOOLTIP.mathPalette}
              onMouseDown={preventToolbarMouseDownStealingFocus}
              onPointerDownCapture={() => {
                if (!editor) return;
                const sel = editor.state.selection;
                mathPaletteSelectionRef.current = { from: sel.from, to: sel.to };
              }}
            >
              <Calculator className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Math
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(100vw-1.5rem,28rem)] max-h-[min(78vh,32rem)] overflow-y-auto p-0"
            align="start"
          >
            <div className="border-b border-slate-100 bg-slate-50/90 px-3 py-2.5 space-y-2">
              <p className="text-xs font-semibold text-slate-800">Insert equation</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 flex-1 justify-center text-xs"
                  title={RICH_TEXT_TOOLTIP.mathInsertInline}
                  onMouseDown={preventToolbarMouseDownStealingFocus}
                  onClick={insertInlineEquation}
                >
                  Inline
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 flex-1 justify-center text-xs"
                  title={RICH_TEXT_TOOLTIP.mathInsertBlock}
                  onMouseDown={preventToolbarMouseDownStealingFocus}
                  onClick={insertBlockEquation}
                >
                  Block
                </Button>
              </div>
            </div>
            <div className="space-y-4 p-3">
              {MATH_PALETTE_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <p className="text-xs font-semibold text-slate-800">{cat.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-1.5 leading-snug">{cat.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.items.map((item) => (
                      <Button
                        key={`${cat.id}-${item.label}`}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 min-w-8 px-2 font-serif text-sm"
                        title={item.latex}
                        onMouseDown={preventToolbarMouseDownStealingFocus}
                        onClick={() => insertLatexSnippet(item.latex)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-slate-600"
          title={RICH_TEXT_TOOLTIP.clear}
          aria-label={RICH_TEXT_TOOLTIP.clear}
          onMouseDown={preventToolbarMouseDownStealingFocus}
          onClick={() => editor.chain().focus().clearContent().run()}
        >
          Clear
        </Button>
      </div>

      {mathEdit ? (
        <div className="border-b border-violet-100 bg-violet-50/50 px-3 py-2 space-y-2">
          <p className="text-xs font-medium text-violet-900">Edit equation (LaTeX)</p>
          <Textarea
            value={mathDraft}
            onChange={(e) => setMathDraft(e.target.value)}
            rows={3}
            className="font-mono text-sm"
            aria-label="LaTeX source"
          />
          <div>
            <p className="text-xs text-slate-600 mb-1">Preview</p>
            <MathPreview latex={mathDraft} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={cancelMathEdit}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={applyMathEdit}>
              Apply
            </Button>
          </div>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarIconButton({
  children,
  tooltip,
  pressed,
  disabled,
  onClick,
}: {
  children: ReactNode;
  /** Shown on hover (`title`) and for screen readers (`aria-label`) */
  tooltip: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <Button
      type="button"
      variant={pressed ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0 shrink-0"
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={disabled ? undefined : preventToolbarMouseDownStealingFocus}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
