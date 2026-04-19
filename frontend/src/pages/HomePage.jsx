import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import SearchBar from "../components/query/SearchBar";
import MessageThread from "../components/query/MessageThread";
import useHistory from "../hooks/useHistory";
import useAskQuestion from "../hooks/useAskQuestion";
import useSessionStore from "../store/sessionStore";
import { SEARCH_SUGGESTIONS } from "../utils/constants";
import { buildMessagesFromHistory, groupHistoryIntoSessions } from "../utils/sessionData";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState("");
  const historyQuery = useHistory();
  const askMutation = useAskQuestion();
  const currentSessionId = useSessionStore((state) => state.currentSessionId);
  const messages = useSessionStore((state) => state.messages);
  const isLoading = useSessionStore((state) => state.isLoading);
  const setSession = useSessionStore((state) => state.setSession);
  const addMessage = useSessionStore((state) => state.addMessage);
  const clearSession = useSessionStore((state) => state.clearSession);
  const replaceMessages = useSessionStore((state) => state.replaceMessages);
  const removeMessage = useSessionStore((state) => state.removeMessage);

  const sessions = groupHistoryIntoSessions(historyQuery.data || []);

  useEffect(() => {
    const question = location.state?.question;
    const nextSessionId = location.state?.sessionId;

    if (question) {
      setInput(question);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (!nextSessionId) {
      return;
    }

    if (historyQuery.isLoading) {
      return;
    }

    if (nextSessionId) {
      const targetSession = sessions.find((session) => session.id === nextSessionId);
      // UX NOTE: Session handoff waits for history data so navigation from graph/history never drops the intended thread.
      if (targetSession) {
        setSession(nextSessionId);
        replaceMessages(buildMessagesFromHistory(targetSession.items));
      }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [
    historyQuery.isLoading,
    location.pathname,
    location.state,
    navigate,
    replaceMessages,
    sessions,
    setSession
  ]);

  const handleSelectSession = (sessionId) => {
    const targetSession = sessions.find((session) => session.id === sessionId);
    if (!targetSession) return;

    setSession(sessionId);
    replaceMessages(buildMessagesFromHistory(targetSession.items));
  };

  const handleNewSession = () => {
    clearSession();
    setInput("");
  };

  const submitQuestion = (questionText = input) => {
    const question = questionText.trim();
    if (!question || askMutation.isPending) return;

    const tempId = `user-${Date.now()}`;
    addMessage({
      id: tempId,
      role: "user",
      content: question,
      createdAt: new Date().toISOString()
    });
    setInput("");

    askMutation.mutate(
      {
        question,
        sessionId: currentSessionId
      },
      {
        onError: () => {
          removeMessage(tempId);
          setInput(question);
        }
      }
    );
  };

  const showConversation = messages.length > 0;

  return (
    <Layout
      title="NeuroGraph Search"
      subtitle="Ask once, recall forever."
      sessions={sessions}
      currentSessionId={currentSessionId}
      onSelectSession={handleSelectSession}
      onNewSession={handleNewSession}
    >
      {showConversation ? (
        <div className="flex h-[calc(100vh-148px)] flex-col">
          <div className="min-h-0 flex-1">
            <MessageThread
              messages={messages}
              isLoading={isLoading}
              onRelatedSelect={(value) => setInput(value)}
            />
          </div>

          <div className="sticky bottom-0 mt-5 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent pt-4">
            <SearchBar
              value={input}
              onChange={setInput}
              onSubmit={() => submitQuestion()}
              isLoading={isLoading}
              placeholder="Ask a follow-up or start a new trail of thought..."
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-220px)] items-center justify-center">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-light">
              Memory-Augmented Search
            </p>
            <h1 className="gradient-text mt-5 text-5xl font-semibold leading-tight sm:text-6xl">
              What would you like to know?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted">
              NeuroGraph remembers every answer. Ask once, recall forever.
            </p>

            <SearchBar
              value={input}
              onChange={setInput}
              onSubmit={() => submitQuestion()}
              isLoading={isLoading}
              autoFocus
              className="mt-10"
              suggestions={SEARCH_SUGGESTIONS}
              onSuggestionClick={(suggestion) => {
                setInput(suggestion);
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
