import { UPLOAD_CONSTANTS } from './constants';
import { FRONTEND_UPLOAD_CONFIG } from './upload-config';

export type UploadValidationResult = {
  isValid: boolean;
  message?: string;
};

const { BYTES_IN_MB, LABELS, MESSAGES } = UPLOAD_CONSTANTS;

const extensionToRule = new Map(
  FRONTEND_UPLOAD_CONFIG.flatMap(rule =>
    rule.extensions.map(ext => [ext, rule] as const)
  )
);

const allowedExtensionsLabel = Array.from(extensionToRule.keys()).join(', ');

const formatSizeInMb = (sizeBytes: number): string => {
  const mb = sizeBytes / BYTES_IN_MB;
  return Number.isInteger(mb) ? `${mb}MB` : `${mb.toFixed(2)}MB`;
};

const getFileExtension = (fileName: string): string => {
  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';
  return ext.toLowerCase();
};

export const validateUploadFile = (file: File): UploadValidationResult => {
  const ext = getFileExtension(file.name) || LABELS.NO_EXTENSION;
  const matchedRule = extensionToRule.get(ext);

  if (!matchedRule) {
    return {
      isValid: false,
      message: MESSAGES.FILE_TYPE_NOT_ACCEPTED(ext, allowedExtensionsLabel),
    };
  }

  if (file.size > matchedRule.maxSizeBytes) {
    return {
      isValid: false,
      message: MESSAGES.FILE_SIZE_EXCEEDED(
        formatSizeInMb(matchedRule.maxSizeBytes),
        matchedRule.type
      ),
    };
  }

  return { isValid: true };
};
