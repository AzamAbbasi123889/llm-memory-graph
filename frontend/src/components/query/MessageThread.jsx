import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import AnswerCard from "./AnswerCard";
import Skeleton from "../ui/Skeleton";
import { formatDateTime } from "../../utils/formatDate";

export default function MessageThread({ messages = [], isLoading = false, onRelatedSelect }) {
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const latestAssistantIndex = [...messages]
    .map((message, index) => ({ message, index }))
    .filter(({ message }) => message.role === "assistant")
    .at(-1)?.index;

  const scrollToBottom = (behavior = "smooth") => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior
    });
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom(messages.length > 2 ? "smooth" : "auto");
    }
  }, [messages, isLoading, isNearBottom]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          const nearBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight < 120;
          setIsNearBottom(nearBottom);
          setShowScrollButton(!nearBottom);
        }}
        className="h-[calc(100vh-280px)] min-h-[360px] space-y-5 overflow-y-auto pr-1"
      >
        {messages.map((message, index) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-2xl rounded-[24px] rounded-br-md bg-primary px-5 py-4 text-sm text-white shadow-glow">
                <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                <p className="mt-2 text-xs text-violet-100/80">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-4xl flex-1">
                <AnswerCard
                  content={message.content}
                  source={message.source}
                  timeTaken={message.timeTaken}
                  tokensUsed={message.tokensUsed}
                  relatedQuestions={message.relatedQuestions}
                  animate={index === latestAssistantIndex}
                  onSelectRelated={onRelatedSelect}
                />
              </div>
            </div>
          )
        )}

        {isLoading ? (
          <div className="glass-panel rounded-[24px] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-11/12 rounded-full" />
              <Skeleton className="h-4 w-10/12 rounded-full" />
              <Skeleton className="h-4 w-9/12 rounded-full" />
            </div>
          </div>
        ) : null}
      </div>

      {showScrollButton ? (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="focus-ring absolute bottom-5 right-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-all duration-150 hover:bg-primary-light active:scale-[0.97]"
          aria-label="Scroll to latest message"
        >
          <ArrowDown className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

