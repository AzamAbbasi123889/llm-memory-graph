export default function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "overflow-hidden rounded-xl bg-bg-elevated",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "relative",
        className
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

