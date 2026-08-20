'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, PauseCircle, PlayCircle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BUSINESS_STATUS_ACTIONS, type BusinessStatusAction } from '@/lib/constants';

export type { BusinessStatusAction };

interface BusinessStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  action: BusinessStatusAction;
  businessName: string;
}

const ACTION_CONFIG: Record<
  BusinessStatusAction,
  { title: string; icon: typeof PauseCircle; iconClass: string; bgClass: string; confirmLabel: string; requiresReason: boolean; description: string }
> = {
  [BUSINESS_STATUS_ACTIONS.PAUSE]: {
    title: 'Pause Business',
    icon: PauseCircle,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-100',
    confirmLabel: 'Pause',
    requiresReason: true,
    description: 'This immediately blocks every user of this business from logging in and using the platform. You can resume access at any time.',
  },
  [BUSINESS_STATUS_ACTIONS.RESUME]: {
    title: 'Resume Business',
    icon: PlayCircle,
    iconClass: 'text-green-600',
    bgClass: 'bg-green-100',
    confirmLabel: 'Resume',
    requiresReason: false,
    description: 'This immediately restores login and platform access for every user of this business.',
  },
  [BUSINESS_STATUS_ACTIONS.DELETE]: {
    title: 'Delete Business',
    icon: Trash2,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-100',
    confirmLabel: 'Delete',
    requiresReason: true,
    description: 'This blocks every user of this business from logging in. Data is not destroyed - the business can be restored later by resuming it.',
  },
};

export function BusinessStatusModal({ isOpen, onClose, onConfirm, action, businessName }: BusinessStatusModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = ACTION_CONFIG[action];

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
    }
  }, [isOpen, action]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleConfirm = async () => {
    if (config.requiresReason && !reason.trim()) {
      setError('A reason is required for this action.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(config.requiresReason ? reason.trim() : undefined);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.body?.message || err.message || `Failed to ${config.confirmLabel.toLowerCase()} business`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.bgClass}`}>
              <config.icon className={`h-5 w-5 ${config.iconClass}`} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-gray-600">{config.description}</p>

          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{businessName}</p>
          </div>

          {config.requiresReason && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="status-reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="status-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Shown to this business's users when they try to log in"
                rows={3}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={action === BUSINESS_STATUS_ACTIONS.RESUME ? 'default' : 'destructive'}
              className={action === BUSINESS_STATUS_ACTIONS.RESUME ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-white'}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Working...' : config.confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
