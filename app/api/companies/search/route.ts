import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type CompanySearchRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ success: true, companies: [] });
  }

  const searchParts = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, address, postal_code, city")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  const companies = ((data as CompanySearchRow[] | null) ?? [])
    .filter((company) => {
      const searchableText = [
        company.name,
        company.address,
        company.postal_code,
        company.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchParts.every((part) => searchableText.includes(part));
    })
    .slice(0, 6);

  return NextResponse.json({ success: true, companies });
}
