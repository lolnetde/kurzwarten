import { requireAdminSession } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  wait_time_disclaimer: string | null;
  environment_type: string | null;
};

function isMissingCompanyProfileError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    message.includes("wait_time_disclaimer") ||
    message.includes("environment_type")
  );
}

export async function POST(request: Request) {
  let body: { slug?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungueltige Anfrage" },
      { status: 400 }
    );
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Unternehmen fehlt." },
      { status: 400 }
    );
  }

  const auth = await requireAdminSession(request, slug);

  if (!auth.ok) {
    return auth.response;
  }

  let { data, error } = await supabaseServer
    .from("companies")
    .select(
      "id, name, slug, address, postal_code, city, wait_time_disclaimer, environment_type"
    )
    .eq("id", auth.session.companyId)
    .eq("slug", slug)
    .maybeSingle();

  if (isMissingCompanyProfileError(error)) {
    const fallbackResult = await supabaseServer
      .from("companies")
      .select("id, name, slug, address, postal_code, city")
      .eq("id", auth.session.companyId)
      .eq("slug", slug)
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
      { success: false, error: "Session konnte nicht geprueft werden." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, company });
}
