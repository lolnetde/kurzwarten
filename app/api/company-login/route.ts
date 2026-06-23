import { createSlug } from "@/lib/slug";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

export async function POST(request: Request) {
  let body: { name?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = createSlug(name);

  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Bitte gib den Unternehmensnamen ein." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, address, postal_code, city")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  const company = data as CompanyRow | null;

  if (error || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, company });
}
