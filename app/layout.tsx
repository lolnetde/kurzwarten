import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "KurzWarten",
  description: "Digitale Warteschlangen einfach verwalten.",
};

const themeScript = `
(() => {
  try {
    const cookieTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("kurzwarten-theme="))
      ?.split("=")[1];
    const storedTheme = window.localStorage.getItem("kurzwarten-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = cookieTheme === "dark" || cookieTheme === "light"
      ? cookieTheme
      : storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.cookie = "kurzwarten-theme=" + theme + "; path=/; max-age=31536000; samesite=lax";
  } catch {}
})();
`;

function getThemeClass(theme: string | undefined) {
  return theme === "dark"
    ? "h-full antialiased dark"
    : "h-full antialiased";
}

function getColorScheme(theme: string | undefined) {
  return theme === "dark" || theme === "light" ? theme : undefined;
}

function getInitialTheme(theme: string | undefined) {
  return theme === "dark" ? "dark" : "light";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("kurzwarten-theme")?.value;

  return (
    <html
      lang="de"
      className={getThemeClass(theme)}
      style={{ colorScheme: getColorScheme(theme) }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Navbar initialTheme={getInitialTheme(theme)} />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
