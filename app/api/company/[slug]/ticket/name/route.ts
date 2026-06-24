import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const MAX_CUSTOMER_NAME_LENGTH = 80;

type CompanyRow = {
  id: string;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { id?: unknown; customer_name?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungueltige Anfrage" },
      { status: 400 }
    );
  }

  const ticketId = Number(body.id);
  const customerName =
    typeof body.customer_name === "string" ? body.customer_name.trim() : "";

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return NextResponse.json(
      { success: false, error: "Ungueltige Ticket-ID" },
      { status: 400 }
    );
  }

  if (!customerName) {
    return NextResponse.json(
      { success: false, error: "Bitte gib einen Namen ein." },
      { status: 400 }
    );
  }

  if (customerName.length > MAX_CUSTOMER_NAME_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Der Name darf maximal ${MAX_CUSTOMER_NAME_LENGTH} Zeichen lang sein.`,
      },
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

  const { data, error } = await supabaseServer
    .from("tickets")
    .update({ customer_name: customerName })
    .eq("company_id", company.id)
    .eq("id", ticketId)
    .select("id, customer_name")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Ticket nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, ticket: data });
}
