import { createSlug } from "@/lib/slug";
import { hashAdminPassword } from "@/lib/admin-auth";
import { normalizeCompanyEnvironment } from "@/lib/company-environments";
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const MAX_COMPANY_NAME_LENGTH = 80;
const MIN_PASSWORD_LENGTH = 4;

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  environment_type: string | null;
};

export async function POST(request: Request) {
  let body: { name?: unknown; password?: unknown; environment_type?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password =
    typeof body.password === "string" ? body.password.trim() : "";
  const environmentType = normalizeCompanyEnvironment(body.environment_type);

  if (!name) {
    return NextResponse.json(
      { success: false, error: "Unternehmensname fehlt" },
      { status: 400 }
    );
  }

  if (name.length > MAX_COMPANY_NAME_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Name darf maximal ${MAX_COMPANY_NAME_LENGTH} Zeichen lang sein`,
      },
      { status: 400 }
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein`,
      },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit(
    `company-create:${getClientIdentifier(request)}`,
    5,
    60 * 60 * 1000
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const slug = createSlug(name);

  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Bitte nutze Buchstaben oder Zahlen im Namen" },
      { status: 400 }
    );
  }

  const { data: existingCompany } = await supabaseServer
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingCompany) {
    return NextResponse.json(
      {
        success: false,
        error: "Dieser Unternehmensname ist bereits vergeben.",
      },
      { status: 409 }
    );
  }

  const hashedPassword = await hashAdminPassword(password);

  const { data, error } = await supabaseServer
    .from("companies")
    .insert({
      name,
      slug,
      admin_password: hashedPassword,
      environment_type: environmentType,
    })
    .select("id, name, slug, address, postal_code, city, environment_type")
    .single();

  const company = data as CompanyRow | null;

  if (error || !company) {
    const lowerMessage = error?.message.toLowerCase() ?? "";

    return NextResponse.json(
      {
        success: false,
        error: lowerMessage.includes("environment_type")
          ? "In Supabase fehlt noch die Spalte environment_type fuer die Branchen-Auswahl."
          : error?.message ?? "Unternehmen konnte nicht erstellt werden",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company });
}
