import { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';

/**
 * PDF downloads for subjective tests. Hand-written because the generated request utility
 * parses responses as JSON; these endpoints stream `application/pdf`.
 * Errors carry the backend `message` so callers can show it as-is.
 */
function fetchPdf(path: string): CancelablePromise<Blob> {
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    try {
      const controller = new AbortController();
      onCancel(() => controller.abort());
      const res = await fetch(`${OpenAPI.BASE}${path}`, {
        method: 'GET',
        credentials: OpenAPI.CREDENTIALS,
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || `Failed to fetch file (${res.status})`);
      }
      resolve(await res.blob());
    } catch (err) {
      reject(err);
    }
  });
}

const base = (businessId: number) => `/api/business/${businessId}/subjective-tests`;
const seg = (value: string) => encodeURIComponent(value);

export class SubjectiveTestFilesService {
  /** Staff: any time. Student: only after starting the test. */
  public static getQuestionPaper(businessId: number, subjectiveTestId: string): CancelablePromise<Blob> {
    return fetchPdf(`${base(businessId)}/${seg(subjectiveTestId)}/question-paper`);
  }

  public static getStaffAnswerSheet(businessId: number, subjectiveTestId: string, submissionId: string): CancelablePromise<Blob> {
    return fetchPdf(`${base(businessId)}/${seg(subjectiveTestId)}/submissions/${seg(submissionId)}/answer-sheet`);
  }

  public static getStaffCheckedAnswerSheet(businessId: number, subjectiveTestId: string, submissionId: string): CancelablePromise<Blob> {
    return fetchPdf(`${base(businessId)}/${seg(subjectiveTestId)}/submissions/${seg(submissionId)}/checked-answer-sheet`);
  }

  public static getOwnAnswerSheet(businessId: number, submissionId: string): CancelablePromise<Blob> {
    return fetchPdf(`${base(businessId)}/submissions/${seg(submissionId)}/answer-sheet`);
  }

  public static getOwnCheckedAnswerSheet(businessId: number, submissionId: string): CancelablePromise<Blob> {
    return fetchPdf(`${base(businessId)}/submissions/${seg(submissionId)}/checked-answer-sheet`);
  }
}
