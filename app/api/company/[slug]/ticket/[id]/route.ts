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
  status: string;
};

type RouteParams = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug, id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { success: false, error: "Ungültige Ticket-ID" },
      { status: 400 }
    );
  }

  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  const company = companyData as CompanyRow | null;

  if (companyError || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("tickets")
    .select("id, customer_name, status")
    .eq("company_id", company.id)
    .eq("id", ticketId)
    .single();

  const ticket = data as TicketRow | null;

  if (error || !ticket) {
    return NextResponse.json(
      { success: false, error: "Ticket nicht gefunden" },
      { status: 404 }
    );
  }

  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("status", "waiting")
    .lt("id", ticket.id);

  const peopleBefore = count ?? 0;

  return NextResponse.json({
    success: true,
    company,
    ticket: {
      id: ticket.id,
      customer_name: ticket.customer_name,
      status: ticket.status,
      peopleBefore,
      estimatedMinutes: peopleBefore * 4,
    },
  });
}
