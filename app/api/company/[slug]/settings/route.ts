import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { city?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const city = typeof body.city === "string" ? body.city.trim() : "";

  const { data, error } = await supabase
    .from("companies")
    .update({ city: city || null })
    .eq("slug", slug)
    .select("id, name, slug, city")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error?.message ?? "Einstellungen konnten nicht gespeichert werden" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company: data });
}
