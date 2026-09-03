export type KnowledgeBaseQueryRequest = {
  courseId: number;
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
