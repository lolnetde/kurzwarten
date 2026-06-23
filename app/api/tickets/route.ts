import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, tickets });
}