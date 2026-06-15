export const CONTENT_UPLOAD_FORMATS = [
  {
    key: 'pdf',
    label: 'PDF',
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    maxSizeMb: 10,
  },
  {
    key: 'image',
    label: 'Image',
    mimeTypes: ['image/*'],
    extensions: ['.jpg', '.jpeg', '.png'],
    maxSizeMb: 5,
  },
  {
    key: 'doc',
    label: 'DOC/DOCX',
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['.doc', '.docx'],
    maxSizeMb: 10,
  },
] as const;

export type ContentUploadFormat = (typeof CONTENT_UPLOAD_FORMATS)[number];

const getFileExtension = (fileName: string): string => {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? `.${parts.pop()}` : '';
};

export function getContentUploadFormatForFile(file: File): ContentUploadFormat | undefined {
  const extension = getFileExtension(file.name);

  return CONTENT_UPLOAD_FORMATS.find((format) => {
    const extensionMatches = (format.extensions as readonly string[]).includes(extension);
    const mimeMatches = format.mimeTypes.some((mimeType) => {
      if (mimeType.endsWith('/*')) {
        return file.type.startsWith(mimeType.slice(0, -2));
      }
      return file.type === mimeType;
    });

    return extensionMatches || mimeMatches;
  });
}

export function getContentUploadSizeError(file: File): string | null {
  const format = getContentUploadFormatForFile(file);
  if (!format) return null;

  const maxSizeBytes = format.maxSizeMb * 1024 * 1024;
  if (file.size <= maxSizeBytes) return null;

  return `${format.label} files must be ${format.maxSizeMb} MB or less`;
}

export const PROFILE_IMAGE_UPLOAD_CONFIG = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  extensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
  maxSizeMb: 5,
} as const;

export const PROFILE_IMAGE_UPLOAD_MAX_SIZE_BYTES =
  PROFILE_IMAGE_UPLOAD_CONFIG.maxSizeMb * 1024 * 1024;

export const PROFILE_IMAGE_UPLOAD_ACCEPT = [
  ...PROFILE_IMAGE_UPLOAD_CONFIG.extensions,
].join(',');

const acceptTokens = CONTENT_UPLOAD_FORMATS.flatMap((format) => [
  ...format.mimeTypes,
  ...format.extensions,
]);

export const CONTENT_UPLOAD_ACCEPT = acceptTokens.join(',');

export const CONTENT_UPLOAD_ALLOWED_EXTENSIONS: string[] = CONTENT_UPLOAD_FORMATS.flatMap(
  (format) => format.extensions
);

export const CONTENT_UPLOAD_LABEL = 'PDF, Image, or DOC';

export const CONTENT_UPLOAD_ERROR_MESSAGE = `Please upload a ${CONTENT_UPLOAD_LABEL} file`;

export const CONTENT_UPLOAD_INFO_ITEMS = CONTENT_UPLOAD_FORMATS.map((format) => ({
  label: format.label,
  extensions: format.extensions.join(', '),
  maxSizeLabel: `${format.maxSizeMb} MB`,
}));
