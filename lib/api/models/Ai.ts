export type KnowledgeBaseQueryRequest = {
  query: string;
};

export type KnowledgeBaseQueryResponse = {
  answer: string;
  document_id?: string | null;
  title?: string | null;
  document_type?: string | null;
  tag?: string | null;
  summary?: string | null;
  source?: string | null;
  page?: number | null;
};

export type SaveAIChatRequest = {
  userMessage: string;
  assistantResponse: string;
  source?: KnowledgeBaseQueryResponse;
};

export type AIChatResponse = {
  id: number;
  userId: number;
  businessId: number;
  userMessage: string;
  assistantResponse: string;
  source?: KnowledgeBaseQueryResponse | null;
  createdAt: string;
  updatedAt: string;
};

export type AIChatListResponse = {
  data: AIChatResponse[];
  total: number;
  limit: number;
  offset: number;
};
