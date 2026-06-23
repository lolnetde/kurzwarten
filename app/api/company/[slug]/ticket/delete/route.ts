import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
  const { slug } = await params;
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

  const { data: companyData, error: companyError } = await supabase
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

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("company_id", company.id)
    .eq("id", ticketId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
