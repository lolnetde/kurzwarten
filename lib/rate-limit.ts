import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = {
  __kurzwartenRateLimit?: Map<string, RateLimitEntry>;
};

const globalRateLimitStore = globalThis as RateLimitStore;
const rateLimitStore =
  globalRateLimitStore.__kurzwartenRateLimit ??
  (globalRateLimitStore.__kurzwartenRateLimit = new Map());

export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const currentEntry = rateLimitStore.get(key);

  if (!currentEntry || currentEntry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (currentEntry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((currentEntry.resetAt - now) / 1000),
    };
  }

  currentEntry.count += 1;
  rateLimitStore.set(key, currentEntry);

  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      success: false,
      error: "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
      },
    }
  );
}
