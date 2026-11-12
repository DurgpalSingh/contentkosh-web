'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadArea } from '@/components/dashboard/contents/FileUploadArea';
import { SUBJECTIVE_TEST_UPLOAD } from '@/lib/tests/subjectiveTest.config';
import type { SubjectiveFieldErrors } from '@/lib/tests/subjectiveTestFormValidation';

export type SubjectiveFieldValues = {
  paperType: string;
  totalMarks: number;
  instructions: string;
};

/** Subjective-only fields (paper type, marks, instructions, question paper). Used by create and edit forms. */
export function SubjectiveTestFormFields({
  values,
  onChange,
  questionPaper,
  onQuestionPaperChange,
  hasExistingPaper = false,
  errors,
  disabled = false,
}: {
  values: SubjectiveFieldValues;
  onChange: (next: SubjectiveFieldValues) => void;
  questionPaper: File | null;
  onQuestionPaperChange: (file: File | null) => void;
  hasExistingPaper?: boolean;
  errors: SubjectiveFieldErrors;
  disabled?: boolean;
}) {
  const [fileError, setFileError] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="paperType">Paper type <span className="text-red-400">*</span></Label>
          <Input
            id="paperType"
            value={values.paperType}
            onChange={(e) => onChange({ ...values, paperType: e.target.value })}
            placeholder="e.g. GS Paper I"
            maxLength={60}
            disabled={disabled}
          />
          {errors.paperType && <p className="text-sm text-red-600 mt-1">{errors.paperType}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalMarks">Total marks <span className="text-red-400">*</span></Label>
          <Input
            id="totalMarks"
            type="number"
            min={1}
            step="any"
            value={Number.isNaN(values.totalMarks) ? '' : values.totalMarks}
            onChange={(e) => onChange({ ...values, totalMarks: e.target.valueAsNumber })}
            disabled={disabled}
          />
          {errors.totalMarks && <p className="text-sm text-red-600 mt-1">{errors.totalMarks}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions for students (optional)</Label>
        <Textarea
          id="instructions"
          value={values.instructions}
          onChange={(e) => onChange({ ...values, instructions: e.target.value })}
          rows={3}
          placeholder="e.g. Write your roll number on every page. Upload one readable PDF."
          maxLength={2000}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Question paper (PDF, max {SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb} MB)
          {!hasExistingPaper && <span className="text-gray-500 font-normal"> — required to publish</span>}
        </Label>
        {hasExistingPaper && !questionPaper && (
          <p className="text-xs text-gray-500">A question paper is uploaded. Choose a new file to replace it.</p>
        )}
        <FileUploadArea
          accept={SUBJECTIVE_TEST_UPLOAD.accept}
          acceptedLabel={SUBJECTIVE_TEST_UPLOAD.acceptedLabel}
          maxSizeMb={SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb}
          value={questionPaper}
          onChange={onQuestionPaperChange}
          onError={setFileError}
          disabled={disabled}
        />
        {(fileError || errors.questionPaper) && (
          <p className="text-sm text-red-600 mt-1">{fileError || errors.questionPaper}</p>
        )}
      </div>
    </>
  );
}
