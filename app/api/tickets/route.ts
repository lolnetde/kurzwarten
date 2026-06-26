import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Diese alte Ticket-API ist deaktiviert.",
    },
    { status: 410 }
  );
}
