import { supabaseServer } from "@/lib/supabase-server";
import { getCurrentTicketDay } from "@/lib/ticket-day";
import { NextResponse } from "next/server";

type CompanyRow = {
  id: string;
  admin_password: string;
};

type TicketHistoryRow = {
  id: number;
  ticket_day: string | null;
  created_at: string;
  status: string;
  called_at: string | null;
  done_at: string | null;
  deleted_at: string | null;
};

type StatsRow = {
  day: string;
  total_tickets: number;
  called_tickets: number;
  done_tickets: number;
  deleted_tickets: number;
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

function addTicketToMap(historyMap: Map<string, HistoryDay>, row: TicketHistoryRow) {
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

async function archiveOldTickets(companyId: string, today: string) {
  const { data, error } = await supabaseServer
    .from("tickets")
    .select("id, ticket_day, created_at, status, called_at, done_at, deleted_at")
    .eq("company_id", companyId)
    .lt("ticket_day", today);

  if (error) {
    return { error };
  }

  const oldTickets = (data as TicketHistoryRow[] | null) ?? [];
  if (oldTickets.length === 0) {
    return { error: null };
  }

  const historyMap = new Map<string, HistoryDay>();

  for (const ticket of oldTickets) {
    addTicketToMap(historyMap, ticket);
  }

  const statsRows = Array.from(historyMap.values()).map((day) => ({
    company_id: companyId,
    day: day.day,
    total_tickets: day.total,
    called_tickets: day.called,
    done_tickets: day.done,
    deleted_tickets: day.deleted,
    updated_at: new Date().toISOString(),
  }));

  const { error: statsError } = await supabaseServer
    .from("ticket_daily_stats")
    .upsert(statsRows, { onConflict: "company_id,day" });

  if (statsError) {
    return { error: statsError };
  }

  const ticketIds = oldTickets.map((ticket) => ticket.id);
  const { error: deleteError } = await supabaseServer
    .from("tickets")
    .delete()
    .eq("company_id", companyId)
    .in("id", ticketIds);

  return { error: deleteError };
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

  const today = getCurrentTicketDay();
  const { error: archiveError } = await archiveOldTickets(company.id, today);

  if (archiveError) {
    return NextResponse.json(
      { success: false, error: archiveError.message },
      { status: 500 }
    );
  }

  const { data: statsData, error: statsError } = await supabaseServer
    .from("ticket_daily_stats")
    .select("day, total_tickets, called_tickets, done_tickets, deleted_tickets")
    .eq("company_id", company.id)
    .order("day", { ascending: false });

  if (statsError) {
    return NextResponse.json(
      { success: false, error: statsError.message },
      { status: 500 }
    );
  }

  const { data: todayData, error: todayError } = await supabaseServer
    .from("tickets")
    .select("id, ticket_day, created_at, status, called_at, done_at, deleted_at")
    .eq("company_id", company.id)
    .eq("ticket_day", today);

  if (todayError) {
    return NextResponse.json(
      { success: false, error: todayError.message },
      { status: 500 }
    );
  }

  const historyMap = new Map<string, HistoryDay>();

  for (const row of (statsData as StatsRow[] | null) ?? []) {
    historyMap.set(row.day, {
      day: row.day,
      total: row.total_tickets,
      called: row.called_tickets,
      done: row.done_tickets,
      deleted: row.deleted_tickets,
    });
  }

  for (const row of (todayData as TicketHistoryRow[] | null) ?? []) {
    addTicketToMap(historyMap, row);
  }

  const history = Array.from(historyMap.values()).sort((left, right) =>
    right.day.localeCompare(left.day)
  );

  return NextResponse.json({ success: true, history });
}
