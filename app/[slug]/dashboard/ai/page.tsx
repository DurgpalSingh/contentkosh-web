'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Loader2, Send, Sparkles, Trash2, X } from 'lucide-react';
import { BatchesService, AiService, Batch, AIChatResponse } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const PENDING_POLL_INTERVAL_MS = 2000;

const extractErrorMessage = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) return String(error);
  const record = error as Record<string, unknown>;
  const body = record.body as Record<string, unknown> | undefined;
  if (body && typeof body.message === 'string') return body.message;
  if (typeof record.message === 'string') return record.message;
  return 'Contentkosh AI could not answer right now';
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const status = (error as Record<string, unknown>).status;
  return typeof status === 'number' ? status : undefined;
};

export default function ContentkoshAiPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const [batches, setBatches] = useState<Batch[]>([]);
  // Chats are persisted by the backend (question first, answer later), so they survive refreshes and tab switches.
  const [chats, setChats] = useState<AIChatResponse[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const pendingChatId = chats.find((chat) => chat.status === 'PENDING')?.id;
  const sending = submitting || pendingChatId !== undefined;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chats, sending]);

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

  const loadChats = useCallback(async () => {
    if (!isAuthenticated || !business?.id) return;

    try {
      const response = await AiService.getChats({
        businessId: business.id,
        limit: 50,
        offset: 0,
      });
      // API returns newest-first (for pagination); reverse to chronological order for display.
      setChats([...(response.data?.data ?? [])].reverse());
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Don't show error to user, just clear messages
      setChats([]);
    }
  }, [business?.id, isAuthenticated]);

  // Load chat history on mount (includes a question still waiting for its answer)
  useEffect(() => {
    const loadInitialChats = async () => {
      setLoadingChats(true);
      await loadChats();
      setLoadingChats(false);
    };

    loadInitialChats();
  }, [loadChats]);

  // Poll the pending chat until the backend stores its answer.
  useEffect(() => {
    if (pendingChatId === undefined || !business?.id) return;
    const businessId = business.id;
    let polling = false;

    const pollPendingChat = async () => {
      if (polling) return;
      polling = true;
      try {
        const response = await AiService.getChat({ businessId, chatId: pendingChatId });
        const updated = response.data;
        if (updated && updated.status !== 'PENDING') {
          setChats((current) => current.map((chat) => (chat.id === updated.id ? updated : chat)));
        }
      } catch (err) {
        if (getErrorStatus(err) === 404) {
          setChats((current) => current.filter((chat) => chat.id !== pendingChatId));
        } else {
          console.error('Failed to check Contentkosh AI answer:', err);
        }
      } finally {
        polling = false;
      }
    };

    // Background tabs throttle timers, so check right away when the student comes back.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void pollPendingChat();
    };

    const intervalId = window.setInterval(() => void pollPendingChat(), PENDING_POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pendingChatId, business?.id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || !business?.id || sending) return;

    setQuery('');
    setSubmitting(true);
    setError(null);

    try {
      const response = await AiService.queryKnowledgeBase({
        businessId: business.id,
        requestBody: {
          query: trimmedQuery,
        },
      });
      const pendingChat = response.data;
      if (pendingChat) {
        setChats((current) => [...current, pendingChat]);
      }
    } catch (err) {
      setQuery(trimmedQuery);
      setError(extractErrorMessage(err));
      // A question may already be in flight (e.g. sent from another tab); resync so it shows up.
      await loadChats();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (pendingChatId === undefined || !business?.id) return;

    try {
      await AiService.deleteChat({
        businessId: business.id,
        chatId: pendingChatId,
      });
      setChats((current) => current.filter((chat) => chat.id !== pendingChatId));
    } catch (err) {
      console.error('Failed to cancel question:', err);
      setError('Failed to cancel the question');
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    if (!business?.id) return;

    try {
      await AiService.deleteChat({
        businessId: business.id,
        chatId,
      });

      // Remove both user and assistant messages for this chat from local state
      setChats((current) => current.filter((chat) => chat.id !== chatId));
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

  const hasCourses = batches.length > 0;

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
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm">
            <div className="min-h-88 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {loadingChats ? (
                <div className="flex h-full min-h-72 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                </div>
              ) : chats.length === 0 ? (
                <div className="flex h-full min-h-72 items-center justify-center text-center">
                  <div>
                    <Sparkles className="mx-auto h-9 w-9 text-cyan-600" />
                    <h2 className="mt-3 text-base font-semibold text-slate-900">Start with a question</h2>
                    <p className="mt-1 max-w-md text-sm text-slate-500">
                      Ask about uploaded PDF content from your enrolled courses.
                    </p>
                  </div>
                </div>
              ) : (
                chats.map((chat) => (
                  <div key={chat.id} className="space-y-4">
                    <article className="flex justify-end">
                      <div className="flex w-full max-w-[88%] items-end justify-end gap-2 sm:max-w-[76%]">
                        <div className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm text-white shadow-sm">
                          <p className="whitespace-pre-wrap break-normal leading-6">{chat.userMessage}</p>
                        </div>
                        {chat.status !== 'PENDING' ? (
                          <button
                            onClick={() => handleDeleteChat(chat.id)}
                            className="shrink-0 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete this chat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </article>

                    <article className="flex justify-start">
                      {chat.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Thinking...
                        </div>
                      ) : chat.status === 'FAILED' ? (
                        <div className="inline-flex max-w-[88%] items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm sm:max-w-[76%]">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <p className="whitespace-pre-wrap leading-6">
                            {chat.errorMessage || 'Contentkosh AI could not answer right now'}
                          </p>
                        </div>
                      ) : (
                        <div className="max-w-[88%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm sm:max-w-[76%]">
                          <p className="whitespace-pre-wrap break-normal leading-6">
                            {chat.assistantResponse || 'No answer was returned.'}
                          </p>
                          {chat.source?.source ? (
                            <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                              Source: {chat.source.title || chat.source.source}
                              {chat.source.page ? `, page ${chat.source.page}` : ''}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </article>
                  </div>
                ))
              )}

              {submitting ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
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
                  disabled={sending || !query.trim()}
                  className="h-11 shrink-0 bg-cyan-600 px-4 text-white hover:bg-cyan-700"
                >
                  {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send
                </Button>
                {pendingChatId !== undefined ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-11 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
