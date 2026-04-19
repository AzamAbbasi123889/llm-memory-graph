export default function Tooltip({ content, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 rounded-lg border border-border bg-bg-elevated px-2 py-1 text-xs text-text-primary shadow-card group-hover:block group-focus-within:block">
        {content}
      </div>
    </div>
  );
}

