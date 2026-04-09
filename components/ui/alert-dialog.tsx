'use client';

import { cn } from '@/lib/utils';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
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

interface AlertDialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md p-6',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface AlertDialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

interface AlertDialogTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return <h2 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h2>;
}

interface AlertDialogDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogDescription({ className, children }: AlertDialogDescriptionProps) {
  return <p className={cn('text-sm text-gray-600 mt-1', className)}>{children}</p>;
}

interface AlertDialogFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <div className={cn('flex justify-end gap-3 mt-6', className)}>{children}</div>
  );
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogAction({ className, children, ...props }: AlertDialogActionProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

export function AlertDialogCancel({ className, children, ...props }: AlertDialogCancelProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
