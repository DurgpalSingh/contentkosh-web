export interface BulkUploadParsedQuestion {
  questionText: string;
  type: string;
  options: Array<string>;
  answer: string;
  solution: string | null;
}

export interface BulkUploadInvalidBlock {
  position: number;
  rawText: string;
  errors: Array<string>;
}

export interface BulkUploadPreviewResponse {
  validQuestions: Array<BulkUploadParsedQuestion>;
  invalidQuestions: Array<BulkUploadInvalidBlock>;
  sessionToken: string;
}

export interface BulkUploadConfirmRequest {
  sessionToken: string;
  testId: string;
  testType: 'practice' | 'exam';
}

export interface BulkUploadConfirmResponse {
  savedCount: number;
}
