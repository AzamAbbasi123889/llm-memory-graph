import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="glass-panel w-full max-w-md animate-slide-up p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-text-muted">{description}</p>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="!h-8 !w-8 !px-0"
            aria-label="Close modal"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>{children}</div>

        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

