import { hasSupabaseServerKey, supabaseServer } from "@/lib/supabase-server";
import {
  DEFAULT_WAIT_TIME_DISCLAIMER,
  MAX_WAIT_TIME_DISCLAIMER_LENGTH,
} from "@/lib/wait-time-disclaimer";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

type CompanyRow = {
  id: string;
  admin_password: string;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: {
    password?: unknown;
    address?: unknown;
    postal_code?: unknown;
    city?: unknown;
    wait_time_disclaimer?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungueltige Anfrage" },
      { status: 400 }
    );
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const postalCode =
    typeof body.postal_code === "string" ? body.postal_code.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const waitTimeDisclaimer =
    typeof body.wait_time_disclaimer === "string"
      ? body.wait_time_disclaimer.trim()
      : DEFAULT_WAIT_TIME_DISCLAIMER;
  const normalizedWaitTimeDisclaimer =
    waitTimeDisclaimer || DEFAULT_WAIT_TIME_DISCLAIMER;

  if (!password) {
    return NextResponse.json(
      { success: false, error: "Bitte gib das Admin-Passwort ein." },
      { status: 400 }
    );
  }

  if (normalizedWaitTimeDisclaimer.length > MAX_WAIT_TIME_DISCLAIMER_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Der Hinweis darf maximal ${MAX_WAIT_TIME_DISCLAIMER_LENGTH} Zeichen lang sein.`,
      },
      { status: 400 }
    );
  }

  const { data: companyData, error: companyError } = await supabaseServer
    .from("companies")
    .select("id, admin_password")
    .eq("slug", slug)
    .maybeSingle();

  const currentCompany = companyData as CompanyRow | null;

  if (companyError) {
    return NextResponse.json(
      { success: false, error: companyError.message },
      { status: 500 }
    );
  }

  if (!currentCompany) {
    return NextResponse.json(
      { success: false, error: "Unternehmen wurde nicht gefunden." },
      { status: 404 }
    );
  }

  if (currentCompany.admin_password !== password) {
    return NextResponse.json(
      { success: false, error: "Admin-Passwort ist falsch." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseServer
    .from("companies")
    .update({
      address: address || null,
      postal_code: postalCode || null,
      city: city || null,
      wait_time_disclaimer: normalizedWaitTimeDisclaimer,
    })
    .eq("id", currentCompany.id)
    .select("id, name, slug, address, postal_code, city, wait_time_disclaimer")
    .maybeSingle();

  if (error) {
    const lowerMessage = error.message.toLowerCase();
    const missingColumn =
      lowerMessage.includes("address") ||
      lowerMessage.includes("postal_code") ||
      lowerMessage.includes("city") ||
      lowerMessage.includes("wait_time_disclaimer") ||
      lowerMessage.includes("column");
    const blockedByDatabase =
      lowerMessage.includes("permission") ||
      lowerMessage.includes("row-level security");

    return NextResponse.json(
      {
        success: false,
        error: missingColumn
          ? "In Supabase fehlt noch eine Settings-Spalte, wahrscheinlich wait_time_disclaimer."
          : blockedByDatabase && !hasSupabaseServerKey
            ? "Supabase blockiert das Speichern. Lege einen Server-Key in der App an oder erlaube Updates fuer companies."
            : error.message,
      },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        success: false,
        error: hasSupabaseServerKey
          ? "Einstellungen konnten nicht gespeichert werden."
          : "Supabase hat die Aenderung nicht angenommen. Wahrscheinlich fehlt der Server-Key oder eine Update-Regel.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company: data });
}
