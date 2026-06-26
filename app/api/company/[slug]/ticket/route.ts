import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Ticket-Erstellung ist nur im Adminbereich moeglich.",
    },
    { status: 410 }
  );
}
