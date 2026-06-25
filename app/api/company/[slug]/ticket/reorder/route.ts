import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentTicketDay } from "@/lib/ticket-day";
import { NextResponse } from "next/server";

function isMissingQueuePositionError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("queue_position") ?? false;
}

type CompanyRow = {
  id: string;
};

type TicketRow = {
  id: number;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { doctor_id?: unknown; ticket_ids?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungueltige Anfrage" },
      { status: 400 }
    );
  }

  const doctorId =
    typeof body.doctor_id === "string" ? body.doctor_id.trim() : "";
  const ticketIds = Array.isArray(body.ticket_ids)
    ? body.ticket_ids.map((ticketId) => Number(ticketId))
    : [];

  if (!doctorId) {
    return NextResponse.json(
      { success: false, error: "Bitte waehle eine Zuordnung aus." },
      { status: 400 }
    );
  }

  if (
    ticketIds.length === 0 ||
    ticketIds.some((ticketId) => !Number.isInteger(ticketId) || ticketId <= 0)
  ) {
    return NextResponse.json(
      { success: false, error: "Ungueltige Ticket-Reihenfolge" },
      { status: 400 }
    );
  }

  const { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id")
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

  const { data: doctorData, error: doctorError } = await supabaseServer
    .from("doctors")
    .select("id")
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
  const { data: tickets, error: ticketsError } = await supabaseServer
    .from("tickets")
    .select("id")
    .eq("company_id", company.id)
    .eq("ticket_day", ticketDay)
    .eq("doctor_id", doctorId)
    .neq("status", "deleted")
    .in("id", ticketIds);

  if (ticketsError) {
    return NextResponse.json(
      { success: false, error: ticketsError.message },
      { status: 500 }
    );
  }

  const existingTicketIds = new Set(
    ((tickets as TicketRow[] | null) ?? []).map((ticket) => ticket.id)
  );

  if (existingTicketIds.size !== ticketIds.length) {
    return NextResponse.json(
      {
        success: false,
        error: "Mindestens ein Ticket gehoert nicht zu dieser Zuordnung.",
      },
      { status: 400 }
    );
  }

  const updateResults = await Promise.all(
    ticketIds.map((ticketId, index) =>
      supabaseServer
        .from("tickets")
        .update({ queue_position: index + 1 })
        .eq("company_id", company.id)
        .eq("ticket_day", ticketDay)
        .eq("doctor_id", doctorId)
        .eq("id", ticketId)
    )
  );
  const updateError = updateResults.find((result) => result.error)?.error;

  if (updateError) {
    if (isMissingQueuePositionError(updateError)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase-Spalte queue_position fehlt. Bitte fuehre zuerst die SQL-Erweiterung aus.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
