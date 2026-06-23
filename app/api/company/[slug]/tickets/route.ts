import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentTicketDay } from "@/lib/ticket-day";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, name, slug, address, postal_code, city")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  const company = companyData as CompanyRow | null;

  if (companyError || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  const ticketDay = getCurrentTicketDay();
  const { data: tickets, error } = await supabaseServer
    .from("tickets")
    .select(
      "id, ticket_number, ticket_day, customer_name, status, created_at, doctor_id, doctors(id, name, treatment_time_min, treatment_time_max)"
    )
    .eq("company_id", company.id)
    .eq("ticket_day", ticketDay)
    .neq("status", "deleted")
    .order("ticket_number", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company, tickets });
}
