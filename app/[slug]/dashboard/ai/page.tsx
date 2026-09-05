'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, Trash2 } from 'lucide-react';
import { BatchesService, AiService, Batch, KnowledgeBaseQueryResponse } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type CourseOption = {
  id: number;
  name: string;
};

type ChatMessage = {
  id: string | number;
  role: 'student' | 'assistant';
  content: string;
  source?: KnowledgeBaseQueryResponse;
  dbId?: number; // For storing database ID of saved chats
};

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const extractErrorMessage = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) return String(error);
  const record = error as Record<string, unknown>;
  const body = record.body as Record<string, unknown> | undefined;
  if (body && typeof body.message === 'string') return body.message;
  if (typeof record.message === 'string') return record.message;
  return 'Contentkosh AI could not answer right now';
};

export default function ContentkoshAiPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const courseOptions = useMemo<CourseOption[]>(() => {
    const byId = new Map<number, CourseOption>();

    for (const batch of batches) {
      const id = batch.course?.id ?? batch.courseId;
      if (typeof id !== 'number') continue;
      const name = batch.course?.name || `Course ${id}`;
      if (!byId.has(id)) {
        byId.set(id, { id, name });
      }
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [batches]);

  useEffect(() => {
    if (selectedCourseId || courseOptions.length === 0) return;
    setSelectedCourseId(courseOptions[0].id);
  }, [courseOptions, selectedCourseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  // Load batches on mount
  useEffect(() => {
    const loadBatches = async () => {
      if (!isAuthenticated || !business?.id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await BatchesService.getApiBatchesAll();
        setBatches((response.data ?? []) as Batch[]);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, [business?.id, isAuthenticated]);

  // Load old chats when course changes
  useEffect(() => {
    const loadOldChats = async () => {
      if (!isAuthenticated || !business?.id || !selectedCourseId) return;

      try {
        setLoadingChats(true);
        const response = await AiService.getChats({
          businessId: business.id,
          courseId: selectedCourseId,
          limit: 50,
          offset: 0,
        });

        if (response.data?.data) {
          const oldMessages: ChatMessage[] = [];
          // API returns newest-first (for pagination); reverse to chronological order for display.
          [...response.data.data].reverse().forEach((chat) => {
            // Add user message
            oldMessages.push({
              id: `user-${chat.id}`,
              role: 'student',
              content: chat.userMessage,
              dbId: chat.id,
            });
            // Add assistant response
            oldMessages.push({
              id: `assistant-${chat.id}`,
              role: 'assistant',
              content: chat.assistantResponse,
              source: chat.source || undefined,
              dbId: chat.id,
            });
          });
          setMessages(oldMessages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        // Don't show error to user, just clear messages
        setMessages([]);
      } finally {
        setLoadingChats(false);
      }
    };

    loadOldChats();
  }, [selectedCourseId, business?.id, isAuthenticated]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || !business?.id || !selectedCourseId || sending) return;

    const studentMessage: ChatMessage = {
      id: createMessageId(),
      role: 'student',
      content: trimmedQuery,
    };

    setMessages((current) => [...current, studentMessage]);
    setQuery('');
    setSending(true);
    setError(null);

    try {
      const response = await AiService.queryKnowledgeBase({
        businessId: business.id,
        requestBody: {
          courseId: selectedCourseId,
          query: trimmedQuery,
        },
      });
      const answer = response.data;
      
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: answer?.answer || 'No answer was returned.',
        source: answer,
      };

      setMessages((current) => [...current, assistantMessage]);

      // Save chat to database
      try {
        await AiService.saveChat({
          businessId: business.id,
          requestBody: {
            courseId: selectedCourseId,
            userMessage: trimmedQuery,
            assistantResponse: answer?.answer || 'No answer was returned.',
            source: answer,
          },
        });
      } catch (saveErr) {
        console.error('Failed to save chat:', saveErr);
        // Don't show error to user, chat is still displayed locally
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (chatId: number | string) => {
    if (!business?.id || typeof chatId === 'string') return;

    try {
      await AiService.deleteChat({
        businessId: business.id,
        chatId,
      });

      // Remove both user and assistant messages for this chat from local state
      setMessages((current) =>
        current.filter((msg) => msg.dbId !== chatId),
      );
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError('Failed to delete chat message');
    }
  };

  if (isLoading || !isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const hasCourses = courseOptions.length > 0;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 sm:gap-5">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-2 text-cyan-700">
            <Bot className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Contentkosh AI</h1>
            <p className="mt-1 text-sm text-slate-600">Ask questions from your enrolled course content.</p>
          </div>
        </div>
      </header>

      {!hasCourses ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <div>
            <Sparkles className="mx-auto h-9 w-9 text-slate-400" />
            <h2 className="mt-3 text-base font-semibold text-slate-900">No enrolled courses found</h2>
            <p className="mt-1 text-sm text-slate-500">Enroll in an active batch to use Contentkosh AI.</p>
          </div>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="ai-course">
              Course
            </label>
            <Select
              id="ai-course"
              value={selectedCourseId ?? ''}
              onChange={(value) => setSelectedCourseId(Number(value))}
              options={courseOptions.map((course) => ({
                value: course.id,
                label: course.name,
              }))}
              triggerClassName="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </section>

          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm">
            <div className="min-h-88 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {loadingChats ? (
                <div className="flex h-full min-h-72 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full min-h-72 items-center justify-center text-center">
                  <div>
                    <Sparkles className="mx-auto h-9 w-9 text-cyan-600" />
                    <h2 className="mt-3 text-base font-semibold text-slate-900">Start with a question</h2>
                    <p className="mt-1 max-w-md text-sm text-slate-500">
                      Choose a course and ask about uploaded PDF content from that course.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex w-full max-w-[88%] items-end gap-2 sm:max-w-[76%]">
                      <div
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          message.role === 'student'
                            ? 'bg-cyan-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-normal leading-6">{message.content}</p>
                        {message.role === 'assistant' && message.source?.source ? (
                          <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                            Source: {message.source.title || message.source.source}
                            {message.source.page ? `, page ${message.source.page}` : ''}
                          </p>
                        ) : null}
                      </div>
                      {message.dbId && (
                        <button
                          onClick={() => handleDeleteChat(message.dbId!)}
                          className="shrink-0 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete this chat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}

              {sending ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {error ? (
              <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ask a question..."
                  maxLength={1000}
                  className="min-h-21 resize-none border-slate-300 focus-visible:ring-cyan-500"
                  disabled={sending}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={sending || !query.trim() || !selectedCourseId}
                  className="h-11 shrink-0 bg-cyan-600 px-4 text-white hover:bg-cyan-700"
                >
                  {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send
                </Button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
