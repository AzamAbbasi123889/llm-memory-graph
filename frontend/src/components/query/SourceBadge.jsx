import { Bot, Zap } from "lucide-react";

export default function SourceBadge({ source = "llm" }) {
  const isMemory = source === "memory";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        isMemory
          ? "bg-success/15 text-success"
          : "bg-info/15 text-info"
      ].join(" ")}
    >
      {isMemory ? <Zap className="h-3.5 w-3.5" aria-hidden="true" /> : <Bot className="h-3.5 w-3.5" aria-hidden="true" />}
      {isMemory ? "From Memory" : "AI Generated"}
    </span>
  );
}

