import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentTicketDay } from "@/lib/ticket-day";
import { NextResponse } from "next/server";

function isMissingQueuePositionError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("queue_position") ?? false;
}

function isMissingEnvironmentError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("environment_type") ?? false;
}

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  environment_type: string | null;
};

type DoctorRow = {
  id: string;
  name: string;
};

type DisplayTicketRow = {
  id: number;
  ticket_number: number;
  status: "waiting" | "called";
  doctor_id: string | null;
  queue_position: number | null;
  called_at: string | null;
  created_at: string;
};

type DisplayTicket = {
  id: number;
  ticket_number: number;
  status: "waiting" | "called";
  queue_position: number | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

function sortWaitingTickets(first: DisplayTicketRow, second: DisplayTicketRow) {
  const firstPosition = first.queue_position ?? first.ticket_number;
  const secondPosition = second.queue_position ?? second.ticket_number;

  if (firstPosition !== secondPosition) {
    return firstPosition - secondPosition;
  }

  return first.ticket_number - second.ticket_number;
}

function sortCalledTickets(first: DisplayTicketRow, second: DisplayTicketRow) {
  const firstCalledAt = first.called_at ?? first.created_at;
  const secondCalledAt = second.called_at ?? second.created_at;

  return secondCalledAt.localeCompare(firstCalledAt);
}

function mapDisplayTicket(ticket: DisplayTicketRow): DisplayTicket {
  return {
    id: ticket.id,
    ticket_number: ticket.ticket_number,
    status: ticket.status,
    queue_position: ticket.queue_position,
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  let { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, name, slug, environment_type")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (isMissingEnvironmentError(companyError)) {
    const fallbackResult = await supabaseServer
      .from("companies")
      .select("id, name, slug")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    companyData = fallbackResult.data
      ? { ...fallbackResult.data, environment_type: null }
      : null;
    companyError = fallbackResult.error;
  }

  const company = companyData as CompanyRow | null;

  if (companyError || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  const { data: doctorData, error: doctorError } = await supabaseServer
    .from("doctors")
    .select("id, name")
    .eq("company_id", company.id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (doctorError) {
    return NextResponse.json(
      { success: false, error: doctorError.message },
      { status: 500 }
    );
  }

  const ticketDay = getCurrentTicketDay();
  let { data: ticketData, error: ticketError } = await supabaseServer
    .from("tickets")
    .select(
      "id, ticket_number, status, doctor_id, queue_position, called_at, created_at"
    )
    .eq("company_id", company.id)
    .eq("ticket_day", ticketDay)
    .in("status", ["waiting", "called"]);

  if (isMissingQueuePositionError(ticketError)) {
    const fallbackResult = await supabaseServer
      .from("tickets")
      .select("id, ticket_number, status, doctor_id, called_at, created_at")
      .eq("company_id", company.id)
      .eq("ticket_day", ticketDay)
      .in("status", ["waiting", "called"]);

    ticketData =
      fallbackResult.data?.map((ticket) => ({
        ...ticket,
        queue_position: null,
      })) ?? null;
    ticketError = fallbackResult.error;
  }

  if (ticketError) {
    return NextResponse.json(
      { success: false, error: ticketError.message },
      { status: 500 }
    );
  }

  const doctors = (doctorData as DoctorRow[] | null) ?? [];
  const tickets = (ticketData as DisplayTicketRow[] | null) ?? [];
  const ticketsByDoctorId = new Map<string, DisplayTicketRow[]>();

  for (const ticket of tickets) {
    const key = ticket.doctor_id ?? "unassigned";
    const groupedTickets = ticketsByDoctorId.get(key) ?? [];

    groupedTickets.push(ticket);
    ticketsByDoctorId.set(key, groupedTickets);
  }

  const columns = doctors.map((doctor) => {
    const doctorTickets = ticketsByDoctorId.get(doctor.id) ?? [];

    return {
      id: doctor.id,
      name: doctor.name,
      called: doctorTickets
        .filter((ticket) => ticket.status === "called")
        .sort(sortCalledTickets)
        .map(mapDisplayTicket),
      waiting: doctorTickets
        .filter((ticket) => ticket.status === "waiting")
        .sort(sortWaitingTickets)
        .map(mapDisplayTicket),
    };
  });

  const knownDoctorIds = new Set(doctors.map((doctor) => doctor.id));
  const unknownTickets = tickets.filter(
    (ticket) => !ticket.doctor_id || !knownDoctorIds.has(ticket.doctor_id)
  );

  if (unknownTickets.length > 0 || columns.length === 0) {
    columns.push({
      id: "unassigned",
      name: "Allgemeine Warteschlange",
      called: unknownTickets
        .filter((ticket) => ticket.status === "called")
        .sort(sortCalledTickets)
        .map(mapDisplayTicket),
      waiting: unknownTickets
        .filter((ticket) => ticket.status === "waiting")
        .sort(sortWaitingTickets)
        .map(mapDisplayTicket),
    });
  }

  return NextResponse.json({
    success: true,
    company: {
      name: company.name,
      slug: company.slug,
      environment_type: company.environment_type,
    },
    columns,
    updated_at: new Date().toISOString(),
  });
}
