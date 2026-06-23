import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type TicketRow = {
  id: number;
  customer_name: string;
  status: string;
};

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { success: false, error: "Ungültige Ticket-ID" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("tickets")
    .select("id, customer_name, status")
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
    .eq("status", "waiting")
    .lt("id", ticket.id);

  const peopleBefore = count ?? 0;

  return NextResponse.json({
    success: true,
    ticket: {
      id: ticket.id,
      customer_name: ticket.customer_name,
      status: ticket.status,
      peopleBefore,
      estimatedMinutes: peopleBefore * 4,
    },
  });
}
