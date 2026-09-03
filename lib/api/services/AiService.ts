import type { ApiResponse } from '../models/ApiResponse';
import type { KnowledgeBaseQueryRequest, KnowledgeBaseQueryResponse } from '../models/Ai';
import { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AiService {
  public static queryKnowledgeBase({
    businessId,
    requestBody,
  }: {
    businessId: number;
    requestBody: KnowledgeBaseQueryRequest;
  }): CancelablePromise<(ApiResponse & { data?: KnowledgeBaseQueryResponse })> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/business/{businessId}/ai/kb/query',
      path: {
        businessId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid input data',
        403: 'Forbidden',
        500: 'Internal server error',
      },
    });
  }
}
