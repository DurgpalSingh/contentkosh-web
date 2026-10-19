'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage';
import { saveBlob } from '@/lib/utils/saveBlob';

type DownloadFileButtonProps = {
  /** Loads the file (e.g. an authenticated blob request). */
  fetchBlob: () => Promise<Blob>;
  fileName: string;
  children: ReactNode;
  icon?: ReactNode;
} & Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'className' | 'disabled'>;

/** Button that fetches a file and saves it, showing a spinner while loading and the API error on failure. */
export function DownloadFileButton({
  fetchBlob,
  fileName,
  children,
  icon,
  variant = 'outline',
  ...buttonProps
}: DownloadFileButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      saveBlob(await fetchBlob(), fileName);
    } catch (err: unknown) {
      toast.error(getApiErrorDetailMessage(err, 'Failed to download file'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      {...buttonProps}
      disabled={loading || buttonProps.disabled}
      onClick={() => void handleClick()}
    >
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (icon ?? <Download className="h-4 w-4 mr-2" />)}
      {children}
    </Button>
  );
}
