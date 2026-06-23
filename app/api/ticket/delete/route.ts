import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  let body: { id?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const ticketId = Number(body.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { success: false, error: "Ungültige Ticket-ID" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", ticketId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
