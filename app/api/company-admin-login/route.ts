import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
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

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, address, postal_code, city, admin_password")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  const company = data as CompanyRow | null;

  if (error || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  if (company.admin_password !== password) {
    return NextResponse.json(
      { success: false, error: "Passwort ist falsch" },
      { status: 401 }
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
    },
  });
}
