import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentTicketDay } from "@/lib/ticket-day";
import { NextResponse } from "next/server";

function isMissingQueuePositionError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("queue_position") ?? false;
}

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
  ticket_number: number;
  queue_position: number | null;
  ticket_day: string;
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

type QueueTicketRow = {
  id: number;
  ticket_number: number;
  queue_position: number | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug, id } = await params;
  const ticketNumber = Number(id);

  if (!Number.isInteger(ticketNumber) || ticketNumber <= 0) {
    return NextResponse.json(
      { success: false, error: "Ungueltige Ticketnummer" },
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

  const ticketDay = getCurrentTicketDay();
  let { data, error } = await supabaseServer
    .from("tickets")
    .select(
      "id, ticket_number, queue_position, ticket_day, customer_name, status, doctor_id, doctors(id, name, treatment_time_min, treatment_time_max)"
    )
    .eq("company_id", company.id)
    .eq("ticket_day", ticketDay)
    .eq("ticket_number", ticketNumber)
    .single();

  if (isMissingQueuePositionError(error)) {
    const fallbackResult = await supabaseServer
      .from("tickets")
      .select(
        "id, ticket_number, ticket_day, customer_name, status, doctor_id, doctors(id, name, treatment_time_min, treatment_time_max)"
      )
      .eq("company_id", company.id)
      .eq("ticket_day", ticketDay)
      .eq("ticket_number", ticketNumber)
      .single();

    data = fallbackResult.data
      ? { ...fallbackResult.data, queue_position: null }
      : null;
    error = fallbackResult.error;
  }

  const ticket = data as TicketRow | null;

  if (error || !ticket) {
    return NextResponse.json(
      { success: false, error: "Ticket nicht gefunden" },
      { status: 404 }
    );
  }

  let waitingQuery = supabaseServer
    .from("tickets")
    .select("id, ticket_number, queue_position")
    .eq("company_id", company.id)
    .eq("ticket_day", ticket.ticket_day)
    .eq("status", "waiting");

  waitingQuery = ticket.doctor_id
    ? waitingQuery.eq("doctor_id", ticket.doctor_id)
    : waitingQuery.is("doctor_id", null);

  let { data: waitingData, error: waitingError } = await waitingQuery;

  if (isMissingQueuePositionError(waitingError)) {
    let fallbackWaitingQuery = supabaseServer
      .from("tickets")
      .select("id, ticket_number")
      .eq("company_id", company.id)
      .eq("ticket_day", ticket.ticket_day)
      .eq("status", "waiting");

    fallbackWaitingQuery = ticket.doctor_id
      ? fallbackWaitingQuery.eq("doctor_id", ticket.doctor_id)
      : fallbackWaitingQuery.is("doctor_id", null);

    const fallbackWaitingResult = await fallbackWaitingQuery;

    waitingData =
      fallbackWaitingResult.data?.map((waitingTicket) => ({
        ...waitingTicket,
        queue_position: null,
      })) ?? null;
    waitingError = fallbackWaitingResult.error;
  }
  const waitingTickets = ((waitingData as QueueTicketRow[] | null) ?? []).sort(
    (firstTicket, secondTicket) => {
      const firstPosition =
        firstTicket.queue_position ?? firstTicket.ticket_number;
      const secondPosition =
        secondTicket.queue_position ?? secondTicket.ticket_number;

      if (firstPosition !== secondPosition) {
        return firstPosition - secondPosition;
      }

      return firstTicket.ticket_number - secondTicket.ticket_number;
    }
  );
  const ticketIndex = waitingTickets.findIndex(
    (waitingTicket) => waitingTicket.id === ticket.id
  );
  const peopleBefore = ticket.status === "waiting" ? Math.max(ticketIndex, 0) : 0;
  const treatmentMin = ticket.doctors?.treatment_time_min ?? 4;
  const treatmentMax = ticket.doctors?.treatment_time_max ?? treatmentMin;
  const estimatedMinutesMin = peopleBefore * treatmentMin;
  const estimatedMinutesMax = peopleBefore * treatmentMax;

  return NextResponse.json({
    success: true,
    company,
    ticket: {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      queue_position: ticket.queue_position,
      ticket_day: ticket.ticket_day,
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
