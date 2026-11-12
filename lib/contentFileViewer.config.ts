export const CONTENT_FILE_VIEWER_BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export const CONTENT_FILE_VIEWER_FILE_MATCHERS = [
  {
    kind: 'pdf',
    viewer: 'pdf',
    mimeFragments: ['pdf'],
    extensions: ['.pdf'],
  },
  {
    kind: 'image',
    viewer: 'image',
    mimeFragments: ['image'],
    extensionPattern: /\.(jpg|jpeg|png|webp)$/i,
  },
  {
    kind: 'doc',
    viewer: 'download',
    mimeFragments: ['word', 'doc'],
    extensionPattern: /\.(doc|docx)$/i,
  },
] as const;

export type ContentFileViewerFileKind = (typeof CONTENT_FILE_VIEWER_FILE_MATCHERS)[number]['kind'];
export type ContentFileViewerMode = (typeof CONTENT_FILE_VIEWER_FILE_MATCHERS)[number]['viewer'] | 'download';

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
