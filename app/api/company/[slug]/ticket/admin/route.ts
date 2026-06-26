import { requireAdminSession } from "@/lib/admin-auth";
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
};

type TicketRow = {
  id: number;
  ticket_number: number;
  ticket_day: string;
  customer_name: string;
  doctor_id: string | null;
  queue_position: number | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { doctor_id?: unknown };

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const doctorId =
    typeof body.doctor_id === "string" ? body.doctor_id.trim() : "";

  const auth = await requireAdminSession(request, slug);

  if (!auth.ok) {
    return auth.response;
  }

  const { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, name, slug, address, postal_code, city")
    .eq("id", auth.session.companyId)
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

  if (!doctorId) {
    return NextResponse.json(
      { success: false, error: "Bitte waehle eine Zuordnung aus." },
      { status: 400 }
    );
  }

  const { data: doctorData, error: doctorError } = await supabaseServer
    .from("doctors")
    .select("id, name, treatment_time_min, treatment_time_max")
    .eq("company_id", company.id)
    .eq("id", doctorId)
    .eq("active", true)
    .maybeSingle();

  if (doctorError) {
    return NextResponse.json(
      { success: false, error: doctorError.message },
      { status: 500 }
    );
  }

  if (!doctorData) {
    return NextResponse.json(
      { success: false, error: "Diese Zuordnung wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const ticketDay = getCurrentTicketDay();
  const { data: latestTicket, error: latestTicketError } = await supabaseServer
    .from("tickets")
    .select("ticket_number")
    .eq("company_id", company.id)
    .eq("ticket_day", ticketDay)
    .order("ticket_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestTicketError) {
    return NextResponse.json(
      { success: false, error: latestTicketError.message },
      { status: 500 }
    );
  }

  const latestTicketNumber =
    typeof latestTicket?.ticket_number === "number"
      ? latestTicket.ticket_number
      : 0;
  const nextTicketNumber = latestTicketNumber + 1;
  const { data: latestQueueTicket, error: latestQueueError } =
    await supabaseServer
      .from("tickets")
      .select("queue_position")
      .eq("company_id", company.id)
      .eq("ticket_day", ticketDay)
      .eq("doctor_id", doctorId)
      .neq("status", "deleted")
      .order("queue_position", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (latestQueueError && !isMissingQueuePositionError(latestQueueError)) {
    return NextResponse.json(
      { success: false, error: latestQueueError.message },
      { status: 500 }
    );
  }

  const nextQueuePosition =
    !isMissingQueuePositionError(latestQueueError) &&
    typeof latestQueueTicket?.queue_position === "number"
      ? latestQueueTicket.queue_position + 1
      : nextTicketNumber;

  let { data, error } = await supabaseServer
    .from("tickets")
    .insert({
      company_id: company.id,
      doctor_id: doctorId,
      ticket_number: nextTicketNumber,
      ticket_day: ticketDay,
      queue_position: nextQueuePosition,
      customer_name: "Vor Ort",
      status: "waiting",
    })
    .select("id, ticket_number, ticket_day, customer_name, doctor_id, queue_position")
    .single();

  if (isMissingQueuePositionError(error)) {
    const fallbackResult = await supabaseServer
      .from("tickets")
      .insert({
        company_id: company.id,
        doctor_id: doctorId,
        ticket_number: nextTicketNumber,
        ticket_day: ticketDay,
        customer_name: "Vor Ort",
        status: "waiting",
      })
      .select("id, ticket_number, ticket_day, customer_name, doctor_id")
      .single();

    data = fallbackResult.data
      ? { ...fallbackResult.data, queue_position: null }
      : null;
    error = fallbackResult.error;
  }

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
      ticket_number: ticket.ticket_number,
      ticket_day: ticket.ticket_day,
      customer_name: ticket.customer_name,
      doctor_id: ticket.doctor_id,
      queue_position: ticket.queue_position,
      doctor: doctorData,
      status: "waiting",
    },
  });
}
