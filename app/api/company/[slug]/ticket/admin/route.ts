import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
};

type TicketRow = {
  id: number;
  customer_name: string;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const { data: companyData, error: companyError } = await supabase
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

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      company_id: company.id,
      customer_name: "Vor Ort",
      status: "waiting",
    })
    .select("id, customer_name")
    .single();

  const ticket = data as TicketRow | null;

  if (error || !ticket) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Ticket konnte nicht erstellt werden",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    ticket: {
      id: ticket.id,
      customer_name: ticket.customer_name,
      status: "waiting",
    },
  });
}
