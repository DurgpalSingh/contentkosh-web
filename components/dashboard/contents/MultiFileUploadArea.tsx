'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { getContentUploadSizeError } from '@/lib/content-upload.config';
import { validateFileType } from './FileUploadArea';

export interface MultiFileUploadAreaProps {
  /** MIME types / extensions to accept, e.g. "application/pdf,.docx" */
  accept: string;
  /** Number of files already selected (used to enforce maxFiles) */
  selectedCount: number;
  /** Maximum number of files that can be selected in total */
  maxFiles: number;
  /** Called with the valid files from a pick/drop */
  onAdd: (files: File[]) => void;
  /** Called with a validation message for rejected files, or null to clear */
  onError?: (error: string | null) => void;
  disabled?: boolean;
  /** Human-readable accepted file label shown in the UI */
  acceptedLabel: string;
}

/**
 * Drag-and-drop / click-to-select area that accepts multiple files.
 * Each file is validated for type and size; invalid files are skipped and
 * reported via onError while valid ones are still added.
 */
export function MultiFileUploadArea({
  accept,
  selectedCount,
  maxFiles,
  onAdd,
  onError,
  disabled = false,
  acceptedLabel,
}: MultiFileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const remaining = maxFiles - selectedCount;
  const isFull = remaining <= 0;
  const isInactive = disabled || isFull;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of Array.from(fileList)) {
      if (!validateFileType(file, accept)) {
        errors.push(`"${file.name}" is not a ${acceptedLabel} file`);
        continue;
      }
      const sizeError = getContentUploadSizeError(file);
      if (sizeError) {
        errors.push(`"${file.name}": ${sizeError}`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > remaining) {
      errors.push(`You can upload up to ${maxFiles} files at once. Only the first ${remaining} were added.`);
      valid.splice(remaining);
    }

    onError?.(errors.length > 0 ? errors.join('. ') : null);
    if (valid.length > 0) onAdd(valid);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (!isInactive && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (isInactive) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so the same file(s) can be selected again after removal
    e.target.value = '';
  };

  const openPicker = () => {
    if (!isInactive) fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  let stateClasses = 'border-slate-300 hover:border-slate-400 bg-white cursor-pointer';
  if (isInactive) {
    stateClasses = 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed';
  } else if (isDragging) {
    stateClasses = 'border-blue-500 bg-blue-50';
  }

  const isCompact = selectedCount > 0;

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isInactive}
      />

      {isDragging && (
        <div role="status" aria-live="polite" className="sr-only">
          Drop files to upload
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${isCompact ? 'p-3' : 'p-6 min-h-[120px]'} ${stateClasses}`}
        role="button"
        tabIndex={isInactive ? -1 : 0}
        aria-label="Upload files area. Click to select files or drag and drop files here."
        aria-describedby="multi-file-upload-instructions"
        aria-disabled={isInactive}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
      >
        <span id="multi-file-upload-instructions" className="sr-only">
          Accepted file types: {acceptedLabel}. Up to {maxFiles} files.
        </span>

        {isCompact ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Upload className="h-4 w-4 text-slate-400" />
            {isFull
              ? `Maximum of ${maxFiles} files selected`
              : `Add more files (${remaining} remaining)`}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-base font-medium text-slate-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500">
              {acceptedLabel} files · up to {maxFiles} at once
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
