import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  type ScryptOptions,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_COOKIE = "kurzwarten-admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

const PASSWORD_HASH_PREFIX = "scrypt";
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const PASSWORD_KEY_LENGTH = 64;

function scrypt(
  password: string,
  salt: string,
  keyLength: number,
  options: ScryptOptions
) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

type AdminSessionPayload = {
  companyId: string;
  slug: string;
  exp: number;
};

type AdminSessionResult =
  | {
      ok: true;
      session: AdminSessionPayload;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function getSessionSecret() {
  const configuredSecret =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "kurzwarten-dev-only-session-secret-change-before-production";
  }

  return "";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken(payload: AdminSessionPayload) {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string | undefined) {
  const secret = getSessionSecret();

  if (!secret || !token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSessionPayload>;

    if (
      typeof payload.companyId !== "string" ||
      typeof payload.slug !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      companyId: payload.companyId,
      slug: payload.slug,
      exp: payload.exp,
    } satisfies AdminSessionPayload;
  } catch {
    return null;
  }
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const requestUrl = new URL(request.url);
    return origin === `${requestUrl.protocol}//${requestUrl.host}`;
  } catch {
    return false;
  }
}

export async function createAdminSession(company: { id: string; slug: string }) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS;
  const token = createSessionToken({
    companyId: company.id,
    slug: company.slug,
    exp: expiresAt,
  });

  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifySessionToken(token);
}

export async function requireAdminSession(
  request: Request,
  slug: string
): Promise<AdminSessionResult> {
  if (!isSameOriginRequest(request)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Ungueltige Anfragequelle." },
        { status: 403 }
      ),
    };
  }

  const session = await getAdminSession();

  if (!session || session.slug !== slug) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Bitte melde dich erneut an." },
        { status: 401 }
      ),
    };
  }

  return { ok: true, session };
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })) as Buffer;

  return [
    PASSWORD_HASH_PREFIX,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt,
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyAdminPassword(password: string, storedPassword: string) {
  if (!storedPassword.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    return {
      ok: storedPassword === password,
      needsRehash: storedPassword === password,
    };
  }

  const [prefix, nValue, rValue, pValue, salt, hash] = storedPassword.split("$");

  if (prefix !== PASSWORD_HASH_PREFIX || !nValue || !rValue || !pValue || !salt || !hash) {
    return { ok: false, needsRehash: false };
  }

  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH, {
    N: Number(nValue),
    r: Number(rValue),
    p: Number(pValue),
  })) as Buffer;

  const storedHash = Buffer.from(hash, "base64url");

  if (storedHash.length !== derivedKey.length) {
    return { ok: false, needsRehash: false };
  }

  return {
    ok: timingSafeEqual(storedHash, derivedKey),
    needsRehash:
      Number(nValue) !== SCRYPT_N ||
      Number(rValue) !== SCRYPT_R ||
      Number(pValue) !== SCRYPT_P,
  };
}
