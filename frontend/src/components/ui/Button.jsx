import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variantClasses = {
  primary:
    "bg-primary text-white shadow-glow hover:bg-primary-light focus-visible:ring-primary/70",
  secondary:
    "border border-border bg-bg-elevated text-text-primary hover:border-primary/40 hover:bg-bg-surface",
  ghost:
    "bg-transparent text-text-muted hover:bg-bg-elevated hover:text-text-primary",
  danger:
    "bg-error text-white hover:bg-red-500 focus-visible:ring-error/50"
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm"
};

const Button = forwardRef(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      type = "button",
      loading = false,
      disabled = false,
      fullWidth = false,
      icon: Icon,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={[
        "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {!loading && Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
);

Button.displayName = "Button";

export default Button;

