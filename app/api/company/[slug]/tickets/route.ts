import { requireAdminSession } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentTicketDay } from "@/lib/ticket-day";
import { NextResponse } from "next/server";

function isMissingQueuePositionError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("queue_position") ?? false;
}

function isMissingEnvironmentError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("environment_type") ?? false;
}

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  environment_type: string | null;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const auth = await requireAdminSession(request, slug);

  if (!auth.ok) {
    return auth.response;
  }

  let { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, name, slug, address, postal_code, city, environment_type")
    .eq("id", auth.session.companyId)
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (isMissingEnvironmentError(companyError)) {
    const fallbackResult = await supabaseServer
      .from("companies")
      .select("id, name, slug, address, postal_code, city")
      .eq("id", auth.session.companyId)
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    companyData = fallbackResult.data
      ? { ...fallbackResult.data, environment_type: null }
      : null;
    companyError = fallbackResult.error;
  }

  const company = companyData as CompanyRow | null;

  if (companyError || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  const ticketDay = getCurrentTicketDay();
  let { data: tickets, error } = await supabaseServer
    .from("tickets")
    .select(
      "id, ticket_number, ticket_day, customer_name, status, created_at, doctor_id, queue_position, doctors(id, name, treatment_time_min, treatment_time_max)"
    )
    .eq("company_id", company.id)
    .eq("ticket_day", ticketDay)
    .neq("status", "deleted")
    .order("ticket_number", { ascending: true });

  if (isMissingQueuePositionError(error)) {
    const fallbackResult = await supabaseServer
      .from("tickets")
      .select(
        "id, ticket_number, ticket_day, customer_name, status, created_at, doctor_id, doctors(id, name, treatment_time_min, treatment_time_max)"
      )
      .eq("company_id", company.id)
      .eq("ticket_day", ticketDay)
      .neq("status", "deleted")
      .order("ticket_number", { ascending: true });

    tickets =
      fallbackResult.data?.map((ticket) => ({
        ...ticket,
        queue_position: null,
      })) ?? null;
    error = fallbackResult.error;
  }

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company, tickets });
}
