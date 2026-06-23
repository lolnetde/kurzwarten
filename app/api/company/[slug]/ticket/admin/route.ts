import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
};

type TicketRow = {
  id: number;
  customer_name: string;
  doctor_id: string | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { doctor_id?: unknown };

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const doctorId =
    typeof body.doctor_id === "string" ? body.doctor_id.trim() : "";

  const { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, name, slug, address, postal_code, city")
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

  if (!doctorId) {
    return NextResponse.json(
      { success: false, error: "Bitte waehle einen Arzt aus." },
      { status: 400 }
    );
  }

  const { data: doctorData, error: doctorError } = await supabaseServer
    .from("doctors")
    .select("id, name, treatment_time_min, treatment_time_max")
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
      { success: false, error: "Dieser Arzt wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const { data, error } = await supabaseServer
    .from("tickets")
    .insert({
      company_id: company.id,
      doctor_id: doctorId,
      customer_name: "Vor Ort",
      status: "waiting",
    })
    .select("id, customer_name, doctor_id")
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

  return NextResponse.json({
    success: true,
    ticket: {
      id: ticket.id,
      customer_name: ticket.customer_name,
      doctor_id: ticket.doctor_id,
      doctor: doctorData,
      status: "waiting",
    },
  });
}
