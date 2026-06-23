import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const city = url.searchParams.get("city")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ success: true, companies: [] });
  }

  let requestBuilder = supabase
    .from("companies")
    .select("id, name, slug, city")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(6);

  if (city) {
    requestBuilder = requestBuilder.ilike("city", `%${city}%`);
  }

  const { data, error } = await requestBuilder;

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, companies: data ?? [] });
}
