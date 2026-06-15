'use client';

import { useRef, useState } from 'react';
import NextImage from 'next/image';
import { Loader2, Upload, FileText, Image as ImageIcon, X } from 'lucide-react';
import {
  CONTENT_UPLOAD_ALLOWED_EXTENSIONS,
  CONTENT_UPLOAD_ERROR_MESSAGE,
  CONTENT_UPLOAD_LABEL,
  getContentUploadSizeError,
} from '@/lib/content-upload.config';

/**
 * Props for the FileUploadArea component
 */
export interface FileUploadAreaProps {
  /** MIME types to accept, e.g., "application/pdf,image/*" */
  accept: string;
  /** Currently selected file */
  value: File | null;
  /** Callback when file is selected */
  onChange: (file: File | null) => void;
  /** Callback for validation errors */
  onError?: (error: string | null) => void;
  /** Whether file is required */
  required?: boolean;
  /** Disable interactions */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Human-readable accepted file label shown in the UI */
  acceptedLabel?: string;
  /** Preview URL for selected/current image files */
  previewUrl?: string | null;
  /** Alt text for preview image */
  previewAlt?: string;
  /** Shows a loading overlay while the selected file is being uploaded */
  isUploading?: boolean;
}

/**
 * Validates if a file's MIME type matches the accepted types
 * Supports wildcards like "image/*"
 * 
 * @param file - The file to validate
 * @param accept - Comma-separated list of accepted MIME types
 * @returns true if file type is valid, false otherwise
 */
export function validateFileType(file: File, accept: string): boolean {
  const acceptedTypes = accept.split(',').map(t => t.trim());
  const fileExtension = (() => {
    const parts = file.name.toLowerCase().split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  })();
  
  return acceptedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type.toLowerCase();
    }

    if (type.endsWith('/*')) {
      // Handle wildcard types like "image/*"
      const prefix = type.slice(0, -2);
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  }) || CONTENT_UPLOAD_ALLOWED_EXTENSIONS.includes(fileExtension);
}

/**
 * Formats file size in bytes to human-readable format
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string like "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * FileUploadArea component - A drag-and-drop file upload area
 * Supports both click-to-upload and drag-and-drop interactions
 */
export function FileUploadArea({
  accept,
  value,
  onChange,
  onError,
  disabled = false,
  className = '',
  acceptedLabel = CONTENT_UPLOAD_LABEL,
  previewUrl,
  previewAlt = 'Selected file preview',
  isUploading = false,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  /**
   * Handles dragenter event
   * Increments drag counter and sets isDragging to true when files are present
   * The drag counter pattern prevents flickering when dragging over child elements
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current++;
    
    // Only set isDragging to true if files are being dragged
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  /**
   * Handles dragover event
   * Must prevent default behavior to allow the drop event to fire
   * Without this, the browser's default behavior would prevent dropping files
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handles dragleave event
   * Decrements drag counter and sets isDragging to false when counter reaches 0
   * The drag counter pattern prevents flickering - isDragging only becomes false
   * when the drag has completely left the component area (counter reaches 0)
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current--;
    
    // Only set isDragging to false when counter reaches 0
    // This means the drag has left the entire component area
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  /**
   * Handles drop event
   * Processes dropped files by resetting drag state and extracting the first file
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag state
    setIsDragging(false);
    dragCounter.current = 0;
    
    // Extract first file from dataTransfer.files
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelection(file);
    }
  };

  /**
   * Handles file selection from both click-to-upload and drag-and-drop
   * Validates file type and calls appropriate callbacks
   * 
   * @param file - The file to validate and process
   */
  const handleFileSelection = (file: File) => {
    // Validate file type using validateFileType helper
    if (!validateFileType(file, accept)) {
      // For invalid files: call onError with error message and onChange with null
      onError?.(CONTENT_UPLOAD_ERROR_MESSAGE);
      onChange(null);
      return;
    }

    const sizeError = getContentUploadSizeError(file);
    if (sizeError) {
      onError?.(sizeError);
      onChange(null);
      return;
    }
    
    // For valid files: clear errors and call onChange with the file
    onError?.(null);
    onChange(file);
  };

  /**
   * Handles file input change event for click-to-upload
   * Extracts the first file from the input element's files array,
   * passes it to handleFileSelection for validation, and resets the input value
   * to allow re-selection of the same file if needed
   * 
   * @param e - The change event from the file input element
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract first file from input element's files array
    const file = e.target.files?.[0] || null;
    
    // Call handleFileSelection with the file (or null if no file)
    if (file) {
      handleFileSelection(file);
    }
    
    // Reset input.value to empty string to allow re-selection of the same file
    e.target.value = '';
  };

  /**
   * Handles removing the selected file
   * Clears both the file (by calling onChange with null) and any error messages
   * (by calling onError with null), returning the component to its initial empty state
   */
  const handleRemoveFile = () => {
    // Clear the selected file
    onChange(null);
    
    // Clear any error messages
    onError?.(null);
  };

  /**
   * Handles click event on the upload area
   * Opens the file picker only if the component is not disabled and no file is selected
   * This prevents opening the file picker when a file is already selected
   * (in that case, the user should use the remove button first)
   */
  const handleClick = () => {
    // Only open file picker if component is not disabled and no file is selected
    if (!disabled && !value) {
      fileInputRef.current?.click();
    }
  };

  /**
   * Handles keyboard events on the upload area for accessibility
   * Enables keyboard users to open the file picker using Enter or Space keys
   * Prevents default behavior to avoid unwanted scrolling (Space) or form submission (Enter)
   * 
   * @param e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Check for Enter or Space key press
    if (e.key === 'Enter' || e.key === ' ') {
      // Prevent default behavior (Space scrolls page, Enter may submit form)
      e.preventDefault();
      
      // Call handleClick to open file picker when conditions are met
      handleClick();
    }
  };

  // Build conditional classes based on state
  const baseClasses = "relative border-2 border-dashed rounded-lg p-6 min-h-[120px] transition-colors";
  
  // Determine state-specific classes
  let stateClasses = "";
  if (disabled) {
    stateClasses = "opacity-50 cursor-not-allowed";
  } else if (value || previewUrl) {
    // Selected state: green border, green background, default cursor
    stateClasses = "border-green-500 bg-green-50 cursor-default";
  } else if (isDragging) {
    // Dragging state: blue border, blue background
    stateClasses = "border-blue-500 bg-blue-50";
  } else {
    // Empty state: slate border with hover effect, white background, pointer cursor
    stateClasses = "border-slate-300 hover:border-slate-400 bg-white cursor-pointer";
  }

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {/* ARIA live region for drag state announcements */}
      {isDragging && (
        <div role="status" aria-live="polite" className="sr-only">
          Drop file to upload
        </div>
      )}
      
      {/* ARIA live region for selected file announcements */}
      {value && (
        <div role="status" aria-live="polite" className="sr-only">
          File selected: {value.name}, {formatFileSize(value.size)}
        </div>
      )}
      
      {/* Main upload area container with conditional styling */}
      <div
        className={`${baseClasses} ${stateClasses}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file area. Click to select a file or drag and drop a file here."
        aria-describedby="file-upload-instructions"
        aria-disabled={disabled}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Hidden span with instructions for screen readers */}
        <span id="file-upload-instructions" className="sr-only">
          Accepted file types: {acceptedLabel}
        </span>
        {/* Empty state - shown when no file is selected */}
        {!value && !previewUrl && (
          <div className="flex flex-col items-center justify-center text-center">
            {/* Upload icon */}
            <Upload className="w-12 h-12 text-slate-400 mb-4" />
            
            {/* Primary instructional text */}
            <p className="text-base font-medium text-slate-700 mb-1">
              Click to upload or drag and drop
            </p>
            
            {/* Secondary text indicating accepted file types */}
            <p className="text-sm text-slate-500">
              {acceptedLabel} files
            </p>
          </div>
        )}
        
        {/* Selected state - shown when a file is selected */}
        {(value || previewUrl) && (
          <div className="flex items-start gap-4">
            {/* File icon - display appropriate icon based on file type */}
            <div className="flex-shrink-0">
              {previewUrl ? (
                <div className="h-14 w-14 overflow-hidden rounded-lg border border-green-200 bg-white">
                  <NextImage
                    src={previewUrl}
                    alt={previewAlt}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : value?.type.startsWith('image/') ? (
                <ImageIcon className="h-10 w-10 text-green-600" />
              ) : (
                <FileText className="h-10 w-10 text-green-600" />
              )}
            </div>
            
            {/* File information */}
            <div className="flex-1 min-w-0">
              {/* File name - prominently displayed */}
              <p className="text-base font-medium text-slate-900 truncate">
                {value?.name ?? 'Current image'}
              </p>
              
              {/* File size - displayed below name */}
              <p className="text-sm text-slate-600 mt-1">
                {value ? formatFileSize(value.size) : `Click to replace or drag and drop a ${acceptedLabel} file`}
              </p>
            </div>
            
            {/* Remove button - X icon in top-right corner */}
            {value && !isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent click handler
                  handleRemoveFile();
                }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-red-100 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/75 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Uploading...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
