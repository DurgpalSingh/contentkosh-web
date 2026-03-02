export const CONTENT_UPLOAD_FORMATS = [
  {
    key: 'pdf',
    label: 'PDF',
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
  {
    key: 'image',
    label: 'Image',
    mimeTypes: ['image/*'],
    extensions: ['.jpg', '.jpeg', '.png'],
  },
  {
    key: 'doc',
    label: 'DOC/DOCX',
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['.doc', '.docx'],
  },
] as const;

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
