import { createSlug } from "@/lib/slug";
import { supabase } from "@/lib/supabase";
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
};

export async function POST(request: Request) {
  let body: { name?: unknown; password?: unknown };

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

  const slug = createSlug(name);

  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Bitte nutze Buchstaben oder Zahlen im Namen" },
      { status: 400 }
    );
  }

  const { data: existingCompany } = await supabase
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

  const { data, error } = await supabase
    .from("companies")
    .insert({ name, slug, admin_password: password })
    .select("id, name, slug, address, postal_code, city")
    .single();

  const company = data as CompanyRow | null;

  if (error || !company) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Unternehmen konnte nicht erstellt werden",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company });
}
