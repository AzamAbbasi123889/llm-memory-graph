import { useEffect, useRef } from "react";
import { ArrowUp, BrainCircuit } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Ask NeuroGraph anything...",
  suggestions = [],
  onSuggestionClick,
  className = "",
  autoFocus = false
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div className={className}>
      <div className="glass-panel rounded-[28px] p-3 transition-all duration-150 focus-within:animate-glow">
        <div className="flex items-end gap-3">
          <div className="mb-2 ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit?.();
              }
            }}
            rows={1}
            autoFocus={autoFocus}
            placeholder={placeholder}
            className="max-h-40 min-h-[56px] flex-1 resize-none bg-transparent px-1 py-3 text-[15px] text-text-primary placeholder:text-text-muted"
            aria-label="Ask NeuroGraph a question"
          />

          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="focus-ring inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-glow transition-all duration-150 hover:bg-primary-light active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send question"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-bg-elevated/70 px-4 py-3 text-sm text-text-muted">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            </div>
            NeuroGraph is thinking...
          </div>
        ) : null}
      </div>

      {suggestions.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick?.(suggestion)}
              className="focus-ring rounded-full border border-border bg-bg-surface/70 px-4 py-2 text-sm text-text-muted transition-all duration-150 hover:border-primary/30 hover:bg-bg-elevated hover:text-text-primary active:scale-[0.97]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

