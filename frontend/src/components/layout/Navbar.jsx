import { Menu } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";

export default function Navbar({ title, subtitle, actions, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-bg-primary/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-text-primary">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

