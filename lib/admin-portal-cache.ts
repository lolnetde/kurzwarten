export type CachedAdminCompany = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  wait_time_disclaimer?: string | null;
  environment_type?: string | null;
};

export type CachedAdminDoctor = {
  id: string;
  name: string;
  treatment_time_min: number;
  treatment_time_max: number;
};

export type CachedAdminTicket = {
  id: number;
  ticket_number: number;
  queue_position: number | null;
  ticket_day: string;
  customer_name: string;
  status: string;
  created_at: string;
  doctor_id: string | null;
  doctors: CachedAdminDoctor | null;
};

export type CachedAdminHistoryDay = {
  day: string;
  total: number;
  called: number;
  done: number;
  deleted: number;
};

type AdminPortalCache = {
  company?: CachedAdminCompany;
  tickets?: CachedAdminTicket[];
  doctors?: CachedAdminDoctor[];
  history?: CachedAdminHistoryDay[];
  updatedAt: number;
};

const CACHE_PREFIX = "kurzwarten-admin-portal-cache";
const memoryCache = new Map<string, AdminPortalCache>();

function getCacheKey(slug: string) {
  return `${CACHE_PREFIX}-${slug}`;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function readStoredCache(slug: string) {
  if (!canUseSessionStorage()) return null;

  try {
    const storedValue = window.sessionStorage.getItem(getCacheKey(slug));
    return storedValue ? (JSON.parse(storedValue) as AdminPortalCache) : null;
  } catch {
    return null;
  }
}

function writeStoredCache(slug: string, cache: AdminPortalCache) {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(getCacheKey(slug), JSON.stringify(cache));
  } catch {
    // The in-memory cache is still useful if storage is unavailable or full.
  }
}

function mergeAdminPortalCache(slug: string, changes: Partial<AdminPortalCache>) {
  const currentCache =
    memoryCache.get(slug) ?? readStoredCache(slug) ?? { updatedAt: 0 };
  const nextCache = {
    ...currentCache,
    ...changes,
    updatedAt: Date.now(),
  };

  memoryCache.set(slug, nextCache);
  writeStoredCache(slug, nextCache);

  return nextCache;
}

export function getAdminPortalCache(slug: string) {
  return memoryCache.get(slug) ?? readStoredCache(slug);
}

export function setCachedAdminCompany(
  slug: string,
  company: CachedAdminCompany
) {
  return mergeAdminPortalCache(slug, { company });
}

export function setCachedAdminTickets(
  slug: string,
  tickets: CachedAdminTicket[]
) {
  return mergeAdminPortalCache(slug, { tickets });
}

export function setCachedAdminDoctors(
  slug: string,
  doctors: CachedAdminDoctor[]
) {
  return mergeAdminPortalCache(slug, { doctors });
}

export function setCachedAdminHistory(
  slug: string,
  history: CachedAdminHistoryDay[]
) {
  return mergeAdminPortalCache(slug, { history });
}

export function clearAdminPortalCache(slug: string) {
  memoryCache.delete(slug);

  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.removeItem(getCacheKey(slug));
  } catch {
    // Nothing else to clear.
  }
}
