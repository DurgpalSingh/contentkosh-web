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

export const CONTENT_FILE_VIEWER_IMAGE = {
  previewWidth: 1200,
  previewHeight: 900,
} as const;

export const CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO = 1;
