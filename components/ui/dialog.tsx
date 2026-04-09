'use client';

import { cn } from '@/lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
}

interface DialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn('text-xl font-semibold text-gray-900', className)}>{children}</h2>
  );
}
