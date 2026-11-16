'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Info, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentsService, Subject } from '@/lib/api';
import { formatFileSize } from '../dashboard/contents/FileUploadArea';
import { MultiFileUploadArea } from '../dashboard/contents/MultiFileUploadArea';
import {
  CONTENT_UPLOAD_ACCEPT,
  CONTENT_UPLOAD_INFO_ITEMS,
  CONTENT_UPLOAD_LABEL,
  CONTENT_UPLOAD_MAX_FILES,
  getContentTitleFromFileName,
} from '@/lib/content-upload.config';
import { validateEntityName } from '@/lib/validation';
import { Input } from '../ui/input';
import { Select } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBatchId?: number;
  onBatchChange: (batchId?: number) => void;
  batches: Array<{
    id?: number;
    displayName?: string;
    codeName?: string;
    courseName?: string;
  }>;
  subjects: Subject[];
  initialSubjectId?: number;
  onCreated?: () => void;
}

interface SelectedContentFile {
  id: string;
  file: File;
  title: string;
}

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const getTitleError = (title: string): string | null => {
  if (title.trim().length < 3) return 'Title must be at least 3 characters long';
  return validateEntityName(title, 'Content title', 100);
};

export function AddContentModal({
  isOpen,
  onClose,
  selectedBatchId,
  onBatchChange,
  batches,
  subjects,
  initialSubjectId,
  onCreated,
}: AddContentModalProps) {
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [selectedFiles, setSelectedFiles] = useState<SelectedContentFile[]>([]);
  const [titleErrors, setTitleErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadInfoOpen, setIsUploadInfoOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(initialSubjectId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const reset = () => {
    setStatus('ACTIVE');
    setSelectedFiles([]);
    setTitleErrors({});
    setError(null);
    setSelectedSubjectId(initialSubjectId);
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedSubjectId(initialSubjectId);
  }, [isOpen, initialSubjectId, subjects]);

  const handleAddFiles = (files: File[]) => {
    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((item) => item.id));
      const added = files
        .filter((file) => !existingKeys.has(getFileKey(file)))
        .map((file) => ({
          id: getFileKey(file),
          file,
          title: getContentTitleFromFileName(file.name),
        }));
      return [...prev, ...added];
    });
  };

  const removeTitleError = (id: string) => {
    setTitleErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
    removeTitleError(id);
    setError(null);
  };

  const handleTitleChange = (id: string, title: string) => {
    setSelectedFiles((prev) => prev.map((item) => (item.id === id ? { ...item, title } : item)));
    removeTitleError(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setError('Please select a batch');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    const nextTitleErrors: Record<string, string> = {};
    for (const item of selectedFiles) {
      const titleError = getTitleError(item.title);
      if (titleError) nextTitleErrors[item.id] = titleError;
    }
    setTitleErrors(nextTitleErrors);
    if (Object.keys(nextTitleErrors).length > 0) {
      setError('Please fix the highlighted file titles');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      selectedFiles.forEach((item) => form.append('files', item.file));
      form.append('titles', JSON.stringify(selectedFiles.map((item) => item.title.trim())));
      if (status) form.append('status', status);
      if (selectedSubjectId !== undefined) {
        form.append('subjectId', String(selectedSubjectId));
      }

      await ContentsService.postApiBatchesContentsBulk({
        batchId: selectedBatchId,
        formData: form,
      });
      onCreated?.();
      const count = selectedFiles.length;
      reset();
      toast.success(count === 1 ? 'Content uploaded successfully' : `${count} contents uploaded successfully`);
      onClose();
    } catch (err: unknown) {
      console.error('Create content failed:', err);
      let message = 'Failed to upload content';
      if (typeof err === 'object' && err !== null) {
        const obj = err as Record<string, unknown>;
        const body = obj['body'] as Record<string, unknown> | undefined;
        if (body && typeof body['message'] !== 'undefined') {
          message = String(body['message']);
        } else if (typeof obj['message'] !== 'undefined') {
          message = String(obj['message']);
        } else {
          message = String(err);
        }
      } else {
        message = String(err);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-semibold text-white">Add Content</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white/80 hover:text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Batch <span className="text-red-500">*</span></label>
            <Select
              id="add-content-batch"
              value={selectedBatchId ?? ''}
              onChange={(value) =>
                onBatchChange(value === '' ? undefined : Number(value))
              }
              options={[
                { value: '', label: 'Select a batch' },
                ...batches.flatMap((b) =>
                  typeof b.id === 'number'
                    ? [
                        {
                          value: b.id,
                          label: `${b.displayName || b.codeName || 'Unnamed Batch'}${b.courseName ? ` • ${b.courseName}` : ''}`,
                        },
                      ]
                    : [],
                ),
              ]}
              triggerClassName="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Subject (optional)</label>
            <Select
              id="add-content-subject"
              value={selectedSubjectId ?? ''}
              onChange={(value) =>
                setSelectedSubjectId(value === '' ? undefined : Number(value))
              }
              options={[
                { value: '', label: 'No subject selected' },
                ...subjects.flatMap((s) =>
                  typeof s.id === 'number'
                    ? [
                        {
                          value: s.id,
                          label: s.name || 'Unnamed Subject',
                        },
                      ]
                    : [],
                ),
              ]}
              triggerClassName="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                Files ({CONTENT_UPLOAD_LABEL}) <span className="text-red-500">*</span>
                <Popover open={isUploadInfoOpen} onOpenChange={setIsUploadInfoOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Upload format and size info"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 hover:text-slate-700"
                      onMouseEnter={() => setIsUploadInfoOpen(true)}
                      onMouseLeave={() => setIsUploadInfoOpen(false)}
                      onFocus={() => setIsUploadInfoOpen(true)}
                      onBlur={() => setIsUploadInfoOpen(false)}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 p-3 text-xs"
                    align="start"
                    sideOffset={8}
                    onMouseEnter={() => setIsUploadInfoOpen(true)}
                    onMouseLeave={() => setIsUploadInfoOpen(false)}
                  >
                    <p className="mb-2 font-semibold text-slate-800">Upload Rules</p>
                    <ul className="space-y-1 text-slate-600">
                      {CONTENT_UPLOAD_INFO_ITEMS.map((item) => (
                        <li key={item.label}>
                          {item.label}: {item.extensions} (Max {item.maxSizeLabel})
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </span>
            </label>
            <div className="mt-1 space-y-3">
              {selectedFiles.length > 0 && (
                <ul className="space-y-2" aria-label="Selected files">
                  {selectedFiles.map((item, index) => {
                    const titleError = titleErrors[item.id];
                    const FileIcon = item.file.type.startsWith('image/') ? ImageIcon : FileText;
                    return (
                      <li
                        key={item.id}
                        className={`rounded-lg border p-3 ${titleError ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FileIcon className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate" title={item.file.name}>{item.file.name}</span>
                          <span className="shrink-0">· {formatFileSize(item.file.size)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="ml-auto shrink-0 rounded-full p-1 hover:bg-red-100 transition-colors disabled:opacity-50"
                            aria-label={`Remove ${item.file.name}`}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                        <label htmlFor={`content-title-${index}`} className="sr-only">
                          Title for {item.file.name}
                        </label>
                        <Input
                          id={`content-title-${index}`}
                          value={item.title}
                          onChange={(e) => handleTitleChange(item.id, e.target.value)}
                          placeholder="Content title"
                          aria-invalid={Boolean(titleError)}
                          className={`mt-2 w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${titleError ? 'border-red-400' : 'border-gray-300'}`}
                          maxLength={100}
                          disabled={loading}
                        />
                        {titleError ? (
                          <p className="mt-1 text-xs text-red-600">{titleError}</p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">{item.title.length}/100 characters</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <MultiFileUploadArea
                accept={CONTENT_UPLOAD_ACCEPT}
                acceptedLabel={CONTENT_UPLOAD_LABEL}
                selectedCount={selectedFiles.length}
                maxFiles={CONTENT_UPLOAD_MAX_FILES}
                onAdd={handleAddFiles}
                onError={setError}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading
                ? 'Uploading...'
                : selectedFiles.length > 1
                  ? `Upload ${selectedFiles.length} files`
                  : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
