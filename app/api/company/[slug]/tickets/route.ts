import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, city")
    .eq("slug", slug)
    .single();

  const company = companyData as CompanyRow | null;

  if (companyError || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("id, customer_name, status, created_at")
    .eq("company_id", company.id)
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company, tickets });
}
