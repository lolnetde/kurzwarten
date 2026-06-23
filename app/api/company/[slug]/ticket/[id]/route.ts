import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

type TicketRow = {
  id: number;
  customer_name: string;
  status: string;
  doctor_id: string | null;
  doctors:
    | {
        id: string;
        name: string;
        treatment_time_min: number;
        treatment_time_max: number;
      }
    | null;
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

  const { data, error } = await supabaseServer
    .from("tickets")
    .select(
      "id, customer_name, status, doctor_id, doctors(id, name, treatment_time_min, treatment_time_max)"
    )
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

  let waitingQuery = supabaseServer
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("status", "waiting")
    .lt("id", ticket.id);

  waitingQuery = ticket.doctor_id
    ? waitingQuery.eq("doctor_id", ticket.doctor_id)
    : waitingQuery.is("doctor_id", null);

  const { count } = await waitingQuery;
  const peopleBefore = count ?? 0;
  const treatmentMin = ticket.doctors?.treatment_time_min ?? 4;
  const treatmentMax = ticket.doctors?.treatment_time_max ?? treatmentMin;
  const estimatedMinutesMin = peopleBefore * treatmentMin;
  const estimatedMinutesMax = peopleBefore * treatmentMax;

  return NextResponse.json({
    success: true,
    company,
    ticket: {
      id: ticket.id,
      customer_name: ticket.customer_name,
      status: ticket.status,
      doctor: ticket.doctors,
      peopleBefore,
      estimatedMinutes: estimatedMinutesMin,
      estimatedMinutesMin,
      estimatedMinutesMax,
    },
  });
}
