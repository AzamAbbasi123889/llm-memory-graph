export default function Spinner({ className = "h-5 w-5" }) {
  return (
    <div
      className={`${className} rounded-full border-2 border-primary/20 border-t-primary animate-spin`}
      aria-hidden="true"
    />
  );
}

