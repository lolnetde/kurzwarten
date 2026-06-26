import { clearAdminPortalCache } from "@/lib/admin-portal-cache";

const LEGACY_STORAGE_PREFIX = "kurzwarten-admin-session";

function getLegacyStorageKey(slug: string) {
  return `${LEGACY_STORAGE_PREFIX}-${slug}`;
}

function clearLegacyAdminPassword(slug: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(getLegacyStorageKey(slug));
}

export async function getCurrentAdminSession(slug: string) {
  clearLegacyAdminPassword(slug);

  const response = await fetch("/api/company-admin-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug }),
  });

  return response.json();
}

export async function logoutAdminSession(slug: string) {
  clearLegacyAdminPassword(slug);
  clearAdminPortalCache(slug);

  try {
    await fetch("/api/company-admin-logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });
  } catch {
    // The local UI still logs out even if the network request fails.
  }
}
