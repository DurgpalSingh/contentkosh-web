import type { ApiResponse } from '../models/ApiResponse';
import type {
  KnowledgeBaseQueryRequest,
  KnowledgeBaseQueryResponse,
  SaveAIChatRequest,
  AIChatResponse,
  AIChatListResponse,
} from '../models/Ai';
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

  public static saveChat({
    businessId,
    requestBody,
  }: {
    businessId: number;
    requestBody: SaveAIChatRequest;
  }): CancelablePromise<(ApiResponse & { data?: AIChatResponse })> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/business/{businessId}/ai/chats',
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

  public static getChats({
    businessId,
    courseId,
    limit = 50,
    offset = 0,
  }: {
    businessId: number;
    courseId: number;
    limit?: number;
    offset?: number;
  }): CancelablePromise<(ApiResponse & { data?: AIChatListResponse })> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/business/{businessId}/ai/chats',
      path: {
        businessId,
      },
      query: {
        courseId,
        limit,
        offset,
      },
      errors: {
        400: 'Invalid input data',
        403: 'Forbidden',
        500: 'Internal server error',
      },
    });
  }

  public static deleteChat({
    businessId,
    chatId,
  }: {
    businessId: number;
    chatId: number;
  }): CancelablePromise<ApiResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/business/{businessId}/ai/chats/{chatId}',
      path: {
        businessId,
        chatId,
      },
      errors: {
        400: 'Invalid input data',
        403: 'Forbidden',
        404: 'Chat not found',
        500: 'Internal server error',
      },
    });
  }
}
