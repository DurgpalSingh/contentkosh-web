import { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { CONTENT_FILES_API } from '../contentFiles.constants';

function getContentFilePath(contentId: number): string {
  return `${CONTENT_FILES_API.CONTENTS_ROUTE}/${encodeURIComponent(String(contentId))}/${CONTENT_FILES_API.FILE_ROUTE}`;
}

function getContentFileUrl(contentId: number): string {
  return `${OpenAPI.BASE}${getContentFilePath(contentId)}`;
}

export class ContentFilesService {
  public static getFileUrl(contentId: number): string {
    return getContentFileUrl(contentId);
  }

  public static getFile(contentId: number): CancelablePromise<Blob> {
    return new CancelablePromise(async (resolve, reject, onCancel) => {
      try {
        const controller = new AbortController();
        onCancel(() => controller.abort());
        const response = await fetch(getContentFileUrl(contentId), {
          method: 'GET',
          credentials: OpenAPI.CREDENTIALS,
          signal: controller.signal,
        });
        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`Failed to fetch file (${response.status}): ${responseText}`);
        }
        resolve(await response.blob());
      } catch (error) {
        reject(error);
      }
    });
  }
}
