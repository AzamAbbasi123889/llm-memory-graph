import { forwardRef } from "react";

const sharedClasses =
  "focus-ring w-full rounded-xl border border-border bg-bg-elevated/70 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-all duration-150 hover:border-primary/30 focus:border-primary focus:shadow-glow";

const Input = forwardRef(
  (
    {
      id,
      label,
      error,
      hint,
      icon: Icon,
      rightSlot,
      as = "input",
      className = "",
      ...props
    },
    ref
  ) => {
    const Component = as;

    return (
      <label className="block">
        {label ? (
          <span className="mb-2 block text-sm font-medium text-text-primary">{label}</span>
        ) : null}

        <div className="relative">
          {Icon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}

          <Component
            id={id}
            ref={ref}
            className={[
              sharedClasses,
              Icon ? "pl-11" : "",
              rightSlot ? "pr-12" : "",
              as === "textarea" ? "min-h-[120px] resize-none" : "",
              error ? "border-error focus:border-error focus:shadow-none" : "",
              className
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...props}
          />

          {rightSlot ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
          ) : null}
        </div>

        {error ? (
          <p id={`${id}-error`} className="mt-2 text-xs text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-2 text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </label>
    );
  }
);

Input.displayName = "Input";

export default Input;

