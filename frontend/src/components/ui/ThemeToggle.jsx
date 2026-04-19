import { Moon, SunMedium } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-muted transition-all duration-150 hover:border-primary/40 hover:text-text-primary active:scale-[0.97]"
    >
      {theme === "dark" ? (
        <SunMedium className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
