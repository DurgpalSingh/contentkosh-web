export const CONTENT_FILE_VIEWER_KIND = {
  PDF: 'pdf',
  IMAGE: 'image',
  DOCX: 'docx',
  DOC: 'doc',
  UNKNOWN: 'unknown',
} as const;

export const CONTENT_FILE_VIEWER_MODE = {
  PDF: CONTENT_FILE_VIEWER_KIND.PDF,
  IMAGE: CONTENT_FILE_VIEWER_KIND.IMAGE,
  DOCX: CONTENT_FILE_VIEWER_KIND.DOCX,
  DOWNLOAD: 'download',
} as const;

export const CONTENT_FILE_VIEWER_STATUS = {
  IDLE: 'idle',
  FETCHING: 'fetching',
  LOADING_PREVIEW: 'loading-preview',
  READY: 'ready',
  ERROR: 'error',
} as const;

export const CONTENT_FILE_VIEWER_BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export const CONTENT_FILE_VIEWER_FILE_MATCHERS = [
  {
    kind: CONTENT_FILE_VIEWER_KIND.PDF,
    viewer: CONTENT_FILE_VIEWER_MODE.PDF,
    mimeFragments: ['pdf'],
    extensions: ['.pdf'],
  },
  {
    kind: CONTENT_FILE_VIEWER_KIND.IMAGE,
    viewer: CONTENT_FILE_VIEWER_MODE.IMAGE,
    mimeFragments: ['image'],
    extensionPattern: /\.(jpg|jpeg|png|webp)$/i,
  },
  {
    kind: CONTENT_FILE_VIEWER_KIND.DOCX,
    viewer: CONTENT_FILE_VIEWER_MODE.DOCX,
    mimeFragments: ['wordprocessingml'],
    extensions: ['.docx'],
  },
  {
    kind: CONTENT_FILE_VIEWER_KIND.DOC,
    viewer: CONTENT_FILE_VIEWER_MODE.DOWNLOAD,
    mimeFragments: ['application/msword'],
    extensionPattern: /\.doc$/i,
  },
] as const;

export type ContentFileViewerFileKind = (typeof CONTENT_FILE_VIEWER_FILE_MATCHERS)[number]['kind'];
export type ContentFileViewerMode =
  | (typeof CONTENT_FILE_VIEWER_FILE_MATCHERS)[number]['viewer']
  | (typeof CONTENT_FILE_VIEWER_MODE)['DOWNLOAD'];

export const CONTENT_FILE_VIEWER_PDF = {
  workerSrc: new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString(),
  baseScale: 1,
  maxScale: 1.8,
  horizontalPaddingPx: 32,
  minAvailableWidthPx: 320,
  pageLabel: (pageNumber: number, pageCount: number) => `Page ${pageNumber} of ${pageCount}`,
  previewLabel: (title: string) => `${title} PDF preview`,
} as const;

export const CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL = {
  HIGHLIGHT: 'highlight',
  ERASE: 'erase',
} as const;

export type ContentFileViewerPdfSelectionTool =
  (typeof CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL)[keyof typeof CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL] | null;

export const CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL_COPY = {
  HIGHLIGHT: {
    ariaLabel: 'Toggle highlighter tool',
    title: 'Turn on, then drag over text to highlight',
  },
  ERASE: {
    ariaLabel: 'Toggle highlight eraser',
    title: 'Turn on, then drag over highlighted text to erase only that part',
  },
} as const;

export const CONTENT_FILE_VIEWER_PDF_VOICE_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi (India)' },
] as const;

export const CONTENT_FILE_VIEWER_PDF_NATURAL_VOICE_MARKERS = ['natural', 'neural'] as const;

export const CONTENT_FILE_VIEWER_PDF_SPEECH_API = {
  SYNTHESIS_PROPERTY: 'speechSynthesis',
  UTTERANCE_PROPERTY: 'SpeechSynthesisUtterance',
  VOICES_CHANGED_EVENT: 'voiceschanged',
} as const;

export type PdfTextHighlightSnapshot = {
  version: number;
  pages: Record<string, {
    textHash: string;
    ranges: Array<{ start: number; end: number }>;
  }>;
};

export const CONTENT_FILE_VIEWER_PDF_HIGHLIGHT = {
  VERSION: 1,
  LOADING_LABEL: 'Loading saved highlights',
  ERROR_MESSAGE: 'PDF highlights could not be synchronized with the server. Please try again.',
  SAVE_BUTTON_LABEL: 'Save highlights',
  SAVING_LABEL: 'Saving highlights...',
  UNSAVED_LABEL: 'Unsaved',
  UNSAVED_DIALOG_TITLE: 'Unsaved PDF highlights',
  UNSAVED_DIALOG_MESSAGE: 'Save your changes before closing? If you discard, your unsaved highlight changes will be lost.',
  SAVE_AND_CLOSE_LABEL: 'Save and close',
  DISCARD_CHANGES_LABEL: 'Discard changes',
  CANCEL_LABEL: 'Cancel',
  SAVE_ERROR_MESSAGE: 'Could not save your highlights. Please try again or discard your changes.',
  legacyStorageKey: (userId: number, contentId: number) =>
    `contentkosh:pdf-highlights:v1:user:${userId}:content:${contentId}`,
} as const;

export const CONTENT_FILE_VIEWER_PDF_AUDIO_PREPARING_LABEL = 'Preparing audio';

export const CONTENT_FILE_VIEWER_PDF_NO_VOICES_LABEL = 'No natural Indian English or Hindi voices available';

export const CONTENT_FILE_VIEWER_IMAGE = {
  previewWidth: 1200,
  previewHeight: 900,
} as const;

export const CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO = 1;
