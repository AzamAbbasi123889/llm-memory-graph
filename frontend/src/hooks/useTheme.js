import { useEffect, useState } from "react";

const STORAGE_KEY = "neurograph.theme";

export default function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || "dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark"))
  };
}
