import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  admin_password: string;
};

type TicketHistoryRow = {
  ticket_day: string | null;
  created_at: string;
  status: string;
  called_at: string | null;
  done_at: string | null;
  deleted_at: string | null;
};

type HistoryDay = {
  day: string;
  total: number;
  called: number;
  done: number;
  deleted: number;
};

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

function getDay(row: TicketHistoryRow) {
  if (row.ticket_day) return row.ticket_day;
  return row.created_at.slice(0, 10);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungueltige Anfrage" },
      { status: 400 }
    );
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (!password) {
    return NextResponse.json(
      { success: false, error: "Bitte gib das Admin-Passwort ein." },
      { status: 400 }
    );
  }

  const { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, admin_password")
    .eq("slug", slug)
    .maybeSingle();

  const company = companyData as CompanyRow | null;

  if (companyError) {
    return NextResponse.json(
      { success: false, error: companyError.message },
      { status: 500 }
    );
  }

  if (!company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen wurde nicht gefunden." },
      { status: 404 }
    );
  }

  if (company.admin_password !== password) {
    return NextResponse.json(
      { success: false, error: "Admin-Passwort ist falsch." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseServer
    .from("tickets")
    .select("ticket_day, created_at, status, called_at, done_at, deleted_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  const historyMap = new Map<string, HistoryDay>();

  for (const row of (data as TicketHistoryRow[] | null) ?? []) {
    const day = getDay(row);
    const historyDay =
      historyMap.get(day) ??
      ({
        day,
        total: 0,
        called: 0,
        done: 0,
        deleted: 0,
      } satisfies HistoryDay);

    historyDay.total += 1;

    if (row.called_at || row.status === "called" || row.status === "done") {
      historyDay.called += 1;
    }

    if (row.done_at || row.status === "done") {
      historyDay.done += 1;
    }

    if (row.deleted_at || row.status === "deleted") {
      historyDay.deleted += 1;
    }

    historyMap.set(day, historyDay);
  }

  const history = Array.from(historyMap.values()).sort((left, right) =>
    right.day.localeCompare(left.day)
  );

  return NextResponse.json({ success: true, history });
}
