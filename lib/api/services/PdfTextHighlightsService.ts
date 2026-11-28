import { OpenAPI } from '../core/OpenAPI';
import { CONTENT_FILES_API } from '../contentFiles.constants';
import type { PdfTextHighlightSnapshot } from '@/lib/contentFileViewer.config';

type ApiResponse<T> = {
  data?: T;
  message?: string;
};

function getHighlightsUrl(contentId: number): string {
  return `${OpenAPI.BASE}${CONTENT_FILES_API.CONTENTS_ROUTE}/${encodeURIComponent(String(contentId))}/${CONTENT_FILES_API.HIGHLIGHTS_ROUTE}`;
}

async function sendPdfTextHighlightsRequest(
  contentId: number,
  method: 'GET' | 'PUT',
  snapshot?: PdfTextHighlightSnapshot
): Promise<PdfTextHighlightSnapshot> {
  const response = await fetch(getHighlightsUrl(contentId), {
    method,
    credentials: OpenAPI.CREDENTIALS,
    headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
    body: snapshot ? JSON.stringify(snapshot) : undefined,
  });
  const result = await response.json() as ApiResponse<PdfTextHighlightSnapshot>;
  if (!response.ok) {
    throw new Error(result.message || `Failed to ${method === 'GET' ? 'load' : 'save'} PDF highlights (${response.status})`);
  }
  if (!result.data) {
    throw new Error('The server returned an invalid PDF highlights response.');
  }
  return result.data;
}

export class PdfTextHighlightsService {
  public static getPdfTextHighlights(contentId: number): Promise<PdfTextHighlightSnapshot> {
    return sendPdfTextHighlightsRequest(contentId, 'GET');
  }

  public static savePdfTextHighlights(
    contentId: number,
    snapshot: PdfTextHighlightSnapshot
  ): Promise<PdfTextHighlightSnapshot> {
    return sendPdfTextHighlightsRequest(contentId, 'PUT', snapshot);
  }
}
