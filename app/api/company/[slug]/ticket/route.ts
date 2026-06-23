import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const MAX_NAME_LENGTH = 60;

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
};

type TicketRow = {
  id: number;
  customer_name: string;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { name?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { success: false, error: "Name fehlt" },
      { status: 400 }
    );
  }

  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Name darf maximal ${MAX_NAME_LENGTH} Zeichen lang sein`,
      },
      { status: 400 }
    );
  }

  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, city")
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

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      company_id: company.id,
      customer_name: name,
      status: "waiting",
    })
    .select("id, customer_name")
    .single();

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

  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("status", "waiting")
    .lt("id", ticket.id);

  const peopleBefore = count ?? 0;

  return NextResponse.json({
    success: true,
    company,
    ticket: {
      id: ticket.id,
      customer_name: ticket.customer_name,
      status: "waiting",
      peopleBefore,
      estimatedMinutes: peopleBefore * 4,
    },
  });
}
