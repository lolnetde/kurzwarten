import {
  createAdminSession,
  hashAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

function isMissingCompanyProfileError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    message.includes("wait_time_disclaimer") ||
    message.includes("environment_type")
  );
}

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  wait_time_disclaimer: string | null;
  environment_type: string | null;
  admin_password: string;
};

export async function POST(request: Request) {
  let body: { slug?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const password =
    typeof body.password === "string" ? body.password.trim() : "";

  if (!slug || !password) {
    return NextResponse.json(
      { success: false, error: "Passwort fehlt" },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit(
    `admin-login:${getClientIdentifier(request)}:${slug}`,
    8,
    15 * 60 * 1000
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  let { data, error } = await supabaseServer
    .from("companies")
    .select(
      "id, name, slug, address, postal_code, city, wait_time_disclaimer, environment_type, admin_password"
    )
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (isMissingCompanyProfileError(error)) {
    const fallbackResult = await supabaseServer
      .from("companies")
      .select("id, name, slug, address, postal_code, city, admin_password")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    data = fallbackResult.data
      ? {
          ...fallbackResult.data,
          wait_time_disclaimer: null,
          environment_type: null,
        }
      : null;
    error = fallbackResult.error;
  }

  const company = data as CompanyRow | null;

  if (error || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  const passwordResult = await verifyAdminPassword(
    password,
    company.admin_password
  );

  if (!passwordResult.ok) {
    return NextResponse.json(
      { success: false, error: "Passwort ist falsch" },
      { status: 401 }
    );
  }

  if (passwordResult.needsRehash) {
    const hashedPassword = await hashAdminPassword(password);

    await supabaseServer
      .from("companies")
      .update({ admin_password: hashedPassword })
      .eq("id", company.id);
  }

  const sessionCreated = await createAdminSession({
    id: company.id,
    slug: company.slug,
  });

  if (!sessionCreated) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Server-Session konnte nicht erstellt werden. Bitte ADMIN_SESSION_SECRET setzen.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      address: company.address,
      postal_code: company.postal_code,
      city: company.city,
      wait_time_disclaimer: company.wait_time_disclaimer,
      environment_type: company.environment_type,
    },
  });
}
