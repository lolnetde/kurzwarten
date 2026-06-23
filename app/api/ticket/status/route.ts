import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const ALLOWED_STATUSES = ["waiting", "called", "done"];

export async function PATCH(request: Request) {
  let body: { id?: unknown; status?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const ticketId = Number(body.id);
  const status = typeof body.status === "string" ? body.status : "";

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { success: false, error: "Ungültige Ticket-ID" },
      { status: 400 }
    );
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: "Ungültiger Status" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
