"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "kurzwarten-theme";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function getInitialTheme(initialTheme: Theme): Theme {
  if (typeof window === "undefined") return initialTheme;

  const cookieTheme = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${STORAGE_KEY}=`))
    ?.split("=")[1];

  if (cookieTheme === "light" || cookieTheme === "dark") {
    return cookieTheme;
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function storeTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  document.cookie = `${STORAGE_KEY}=${theme}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20.4 14.3A7.8 7.8 0 0 1 9.7 3.6 8.8 8.8 0 1 0 20.4 14.3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function ThemeToggle({
  initialTheme = "light",
}: {
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(initialTheme));

  useEffect(() => {
    applyTheme(theme);
    storeTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-blue-700 hover:shadow-sm"
      aria-label="Darstellung wechseln"
      title="Darstellung wechseln"
      suppressHydrationWarning
    >
      <span className="theme-toggle-sun">
        <SunIcon />
      </span>
      <span className="theme-toggle-moon">
        <MoonIcon />
      </span>
    </button>
  );
}
