import { UPLOAD_CONSTANTS } from './constants';

const {
  BYTES_IN_MB,
  TYPES,
  EXTENSIONS,
  MAX_SIZE_MB,
} = UPLOAD_CONSTANTS;

export type UploadType = typeof TYPES[keyof typeof TYPES];

export type UploadRule = {
  type: UploadType;
  extensions: string[];
  maxSizeBytes: number;
};

export const FRONTEND_UPLOAD_CONFIG: UploadRule[] = [
  {
    type: TYPES.PDF,
    extensions: [EXTENSIONS.PDF],
    maxSizeBytes: MAX_SIZE_MB.PDF * BYTES_IN_MB,
  },
  {
    type: TYPES.IMAGE,
    extensions: [EXTENSIONS.JPG, EXTENSIONS.JPEG, EXTENSIONS.PNG],
    maxSizeBytes: MAX_SIZE_MB.IMAGE * BYTES_IN_MB,
  },
];

export const FRONTEND_UPLOAD_ACCEPT = FRONTEND_UPLOAD_CONFIG
  .flatMap(rule => rule.extensions)
  .join(',');
