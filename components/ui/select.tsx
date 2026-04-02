'use client';

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// --- Focus navigation (scoped to this select; used for Enter → focus next field) ---

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isElementVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = typeof window !== 'undefined' ? window.getComputedStyle(el) : null;
  if (style && (style.visibility === 'hidden' || style.display === 'none')) return false;
  return true;
}

function getFocusableElements(root: HTMLElement | Document): HTMLElement[] {
  const node = root instanceof Document ? root.documentElement : root;
  const candidates = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter((el) => {
    if (!isElementVisible(el)) return false;
    const tabIndex = el.getAttribute('tabindex');
    if (tabIndex === '-1') return false;
    return true;
  });
}

function focusNextFocusableAfter(current: HTMLElement, root: HTMLElement | Document): void {
  const list = getFocusableElements(root);
  const idx = list.indexOf(current);
  if (idx === -1) return;
  const next = list[idx + 1];
  if (next) next.focus();
}

// --- Listbox keyboard factories (shared pattern for trigger + open panel) ---

interface ListboxTriggerKeyDownOptions {
  disabled: boolean;
  itemCount: number;
  onOpen: () => void;
  getInitialHighlightIndex: () => number;
  setHighlightIndex: (index: number) => void;
}

function createListboxTriggerKeyDownHandler(
  options: ListboxTriggerKeyDownOptions,
): (event: ReactKeyboardEvent<HTMLElement>) => void {
  const { disabled, itemCount, onOpen, getInitialHighlightIndex, setHighlightIndex } = options;

  return (event: ReactKeyboardEvent<HTMLElement>) => {
    if (disabled || itemCount === 0) return;

    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
      event.preventDefault();
      const initial = Math.min(Math.max(0, getInitialHighlightIndex()), Math.max(0, itemCount - 1));
      setHighlightIndex(initial);
      onOpen();
    }
  };
}

interface ListboxPanelKeyDownOptions {
  itemCount: number;
  highlightIndex: number;
  setHighlightIndex: (index: number) => void;
  onCommitIndex: (index: number) => void;
  onClose: () => void;
  getTriggerElement: () => HTMLElement | null;
  getFormRoot: () => HTMLElement | null;
}

function createListboxPanelKeyDownHandler(
  options: ListboxPanelKeyDownOptions,
): (event: ReactKeyboardEvent<HTMLElement>) => void {
  const {
    itemCount,
    highlightIndex,
    setHighlightIndex,
    onCommitIndex,
    onClose,
    getTriggerElement,
    getFormRoot,
  } = options;

  return (event: ReactKeyboardEvent<HTMLElement>) => {
    if (itemCount === 0) return;

    const { key } = event;

    if (key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex(Math.min(highlightIndex + 1, itemCount - 1));
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex(Math.max(highlightIndex - 1, 0));
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      setHighlightIndex(0);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      setHighlightIndex(itemCount - 1);
      return;
    }

    if (key === 'Enter') {
      event.preventDefault();
      const idx = Math.min(Math.max(0, highlightIndex), itemCount - 1);
      onCommitIndex(idx);
      onClose();
      const trigger = getTriggerElement();
      const root = getFormRoot();
      if (trigger && root) {
        requestAnimationFrame(() => {
          focusNextFocusableAfter(trigger, root);
        });
      }
    }
  };
}

// --- Component ---

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  id: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  /** When omitted, the enclosing `<form>` is found via `closest('form')` from the trigger. */
  formRootRef?: RefObject<HTMLElement | null>;
  'aria-labelledby'?: string;
}

function findSelectedIndex(options: SelectOption[], value: string | number): number {
  const idx = options.findIndex((o) => o.value === value);
  return idx >= 0 ? idx : 0;
}

export function Select({
  id,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select…',
  className,
  triggerClassName,
  formRootRef,
  'aria-labelledby': ariaLabelledBy,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const itemCount = options.length;

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label;
  }, [options, value]);

  const getInitialHighlightIndex = useCallback(
    () => findSelectedIndex(options, value),
    [options, value],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        setHighlightIndex(findSelectedIndex(options, value));
      }
    },
    [options, value],
  );

  const resolveFormRoot = useCallback((): HTMLElement | null => {
    return formRootRef?.current ?? triggerRef.current?.closest('form');
  }, [formRootRef]);

  const moveFocusToNextField = useCallback(() => {
    const trigger = triggerRef.current;
    const root = resolveFormRoot();
    if (!trigger || !root) return;
    requestAnimationFrame(() => {
      focusNextFocusableAfter(trigger, root);
    });
  }, [resolveFormRoot]);

  const commitIndex = useCallback(
    (index: number) => {
      const opt = options[index];
      if (opt) onChange(opt.value);
    },
    [onChange, options],
  );

  const onTriggerKeyDown = useMemo(
    () =>
      createListboxTriggerKeyDownHandler({
        disabled: Boolean(disabled),
        itemCount,
        onOpen: () => handleOpenChange(true),
        getInitialHighlightIndex,
        setHighlightIndex,
      }),
    [disabled, itemCount, handleOpenChange, getInitialHighlightIndex],
  );

  const onPanelKeyDown = useMemo(
    () =>
      createListboxPanelKeyDownHandler({
        itemCount,
        highlightIndex,
        setHighlightIndex,
        onCommitIndex: (index) => {
          commitIndex(index);
        },
        onClose: () => setOpen(false),
        getTriggerElement: () => triggerRef.current,
        getFormRoot: resolveFormRoot,
      }),
    [itemCount, highlightIndex, commitIndex, resolveFormRoot],
  );

  const onOptionPointerDown = useCallback(
    (index: number) => {
      commitIndex(index);
      setOpen(false);
      moveFocusToNextField();
    },
    [commitIndex, moveFocusToNextField],
  );

  const showPlaceholder = selectedLabel === undefined;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-labelledby={ariaLabelledBy}
          disabled={disabled || itemCount === 0}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName,
          )}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={cn('truncate', showPlaceholder && 'text-muted-foreground')}>
            {showPlaceholder ? placeholder : selectedLabel}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[var(--radix-popover-trigger-width)] p-1', className)}
        align="start"
        sideOffset={4}
        onEscapeKeyDown={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          listboxRef.current?.focus();
        }}
      >
        <div
          ref={listboxRef}
          id={listId}
          role="listbox"
          tabIndex={0}
          aria-activedescendant={`${id}-opt-${highlightIndex}`}
          className="max-h-60 overflow-auto rounded-md outline-none"
          onKeyDown={onPanelKeyDown}
        >
          {options.map((opt, index) => {
            const optionId = `${id}-opt-${index}`;
            const isHighlighted = index === highlightIndex;
            const isSelected = opt.value === value;
            return (
              <div
                key={String(opt.value)}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-2 text-sm outline-none',
                  isHighlighted && 'bg-accent text-accent-foreground',
                  !isHighlighted && isSelected && 'bg-muted/60',
                )}
                onMouseEnter={() => setHighlightIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onOptionPointerDown(index);
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
