'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuestionModalFrameProps = {
  open: boolean
  titleId: string
  title: string
  subtitle?: string
  onClose: () => void
  /** Full form: scrollable fields + sticky actions (footer inside your `<form>`). */
  children: ReactNode
}

/**
 * Shared shell for Add / Edit question dialogs — backdrop blur, gradient header, scroll region.
 */
export function QuestionModalFrame({ open, titleId, title, subtitle, onClose, children }: QuestionModalFrameProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px] transition-opacity"
        aria-hidden
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[min(92vh,56rem)] w-full max-w-5xl flex-col overflow-hidden',
          'rounded-t-2xl border border-border/60 bg-background shadow-2xl ring-1 ring-black/[0.04] sm:rounded-2xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative shrink-0 border-b border-border/80 bg-gradient-to-br from-muted/70 via-background to-muted/30 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-0.5">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {title}
              </h2>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'shrink-0 rounded-full p-2 text-muted-foreground transition-colors',
                'hover:bg-muted hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
