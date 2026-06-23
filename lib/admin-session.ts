const STORAGE_PREFIX = "kurzwarten-admin-session";

function getStorageKey(slug: string) {
  return `${STORAGE_PREFIX}-${slug}`;
}

export function getSavedAdminPassword(slug: string) {
  if (typeof window === "undefined") return "";

  try {
    const savedSession = window.localStorage.getItem(getStorageKey(slug));
    if (!savedSession) return "";

    const parsedSession = JSON.parse(savedSession) as { password?: unknown };
    return typeof parsedSession.password === "string"
      ? parsedSession.password
      : "";
  } catch {
    return "";
  }
}

export function saveAdminPassword(slug: string, password: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getStorageKey(slug),
    JSON.stringify({ password, savedAt: Date.now() })
  );
}

export function clearAdminPassword(slug: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(getStorageKey(slug));
}
