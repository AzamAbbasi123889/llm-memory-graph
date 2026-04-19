import { useEffect, useState } from "react";
import { Check, Clock3, Copy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import SourceBadge from "./SourceBadge";
import RelatedChips from "./RelatedChips";
import { formatDuration } from "../../utils/formatDate";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("md", markdown);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);

function MarkdownCodeBlock({ inline, className, children, node: _node, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const value = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className="rounded-md bg-bg-elevated px-1.5 py-0.5 font-mono text-[0.9em]" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-slate-950/80 px-4 py-2 text-xs text-slate-300">
        <span>{match?.[1] || "text"}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Code copied");
            window.setTimeout(() => setCopied(false), 1800);
          }}
          className="focus-ring inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors duration-150 hover:bg-white/10"
          aria-label="Copy code block"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        language={match?.[1] || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "16px",
          background: "#0d1117"
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export default function AnswerCard({
  content,
  source = "llm",
  timeTaken,
  tokensUsed,
  relatedQuestions = [],
  animate = false,
  onSelectRelated
}) {
  const [copied, setCopied] = useState(false);
  const [visibleContent, setVisibleContent] = useState(content);

  useEffect(() => {
    if (!animate || content.includes("```")) {
      setVisibleContent(content);
      return undefined;
    }

    const words = content.split(" ");
    let index = 0;
    setVisibleContent("");

    const timer = window.setInterval(() => {
      index += 8;
      setVisibleContent(words.slice(0, index).join(" "));

      if (index >= words.length) {
        window.clearInterval(timer);
      }
    }, 20);

    return () => window.clearInterval(timer);
  }, [animate, content]);

  return (
    <article className="glass-panel animate-slide-up rounded-[24px] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/15 text-info">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">NeuroGraph</p>
            <p className="text-xs text-text-muted">Memory-augmented answer</p>
          </div>
        </div>

        <SourceBadge source={source} />
      </div>

      <div className="max-w-none text-sm text-text-primary [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:leading-7 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:leading-7 [&_pre]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-bg-elevated [&_th]:px-3 [&_th]:py-2 [&_ul]:space-y-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: MarkdownCodeBlock,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary/40 pl-4 text-text-muted">
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-primary/40 underline-offset-4 transition-colors duration-150 hover:text-primary-light"
              >
                {children}
              </a>
            )
          }}
        >
          {visibleContent}
        </ReactMarkdown>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDuration(timeTaken)}
        </span>
        {tokensUsed ? <span>{tokensUsed.toLocaleString()} tokens</span> : null}
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            toast.success("Answer copied");
            window.setTimeout(() => setCopied(false), 1800);
          }}
          className="focus-ring inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy all"}
        </button>
      </div>

      <RelatedChips items={relatedQuestions} onSelect={onSelectRelated} />
    </article>
  );
}
