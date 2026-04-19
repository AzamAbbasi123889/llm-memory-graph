export default function RelatedChips({ items = [], onSelect }) {
  if (!items.length) return null;

  return (
    <div className="mt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        Related
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect?.(item)}
            className="focus-ring rounded-full border border-border bg-bg-elevated px-3 py-2 text-xs text-text-muted transition-all duration-150 hover:border-primary/30 hover:text-text-primary active:scale-[0.97]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

