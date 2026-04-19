import { Maximize2, Minus, Plus } from "lucide-react";
import Button from "../ui/Button";

export default function GraphControls({
  selectedTopic,
  topics = [],
  onTopicChange,
  showAnswers,
  onToggleAnswers,
  onZoomIn,
  onZoomOut,
  onFit
}) {
  return (
    <div className="glass-panel absolute right-4 top-4 z-20 w-full max-w-[280px] rounded-[24px] p-4">
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={onZoomIn} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" onClick={onZoomOut} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" onClick={onFit} aria-label="Fit graph">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        Topic filter
      </label>
      <select
        value={selectedTopic}
        onChange={(event) => onTopicChange?.(event.target.value)}
        className="focus-ring mt-2 w-full rounded-xl border border-border bg-bg-elevated px-3 py-3 text-sm text-text-primary"
      >
        <option value="all">All topics</option>
        {topics.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>

      <label className="mt-4 flex items-center gap-3 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={showAnswers}
          onChange={(event) => onToggleAnswers?.(event.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-elevated text-primary focus:ring-primary"
        />
        Show answer nodes
      </label>
    </div>
  );
}

