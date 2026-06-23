"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
};

type TicketInfo = {
  id: number;
  customer_name: string;
  status: string;
  peopleBefore: number;
  estimatedMinutes: number;
};

const MAX_NAME_LENGTH = 60;

function getSavedTicketKey(slug: string) {
  return `kurzwarten-ticket-${slug}`;
}

export default function CompanyWartenPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [message, setMessage] = useState("");
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const trimmedName = name.trim();
  const isNameTooLong = trimmedName.length > MAX_NAME_LENGTH;
  const canCreateTicket =
    trimmedName.length > 0 && !isNameTooLong && !isCreating && !!company;

  const loadTicketStatus = useCallback(async (ticketId: number) => {
    try {
      const response = await fetch(`/api/company/${slug}/ticket/${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
        setCompany(data.company);
        setMessage("");

        if (data.ticket.status === "done") {
          window.localStorage.removeItem(getSavedTicketKey(slug));
        }

        return;
      }

      window.localStorage.removeItem(getSavedTicketKey(slug));
      setTicket(null);
      setMessage(data.error ?? "Ticket wurde nicht gefunden.");
    } catch {
      setMessage("Live-Status konnte gerade nicht aktualisiert werden.");
    }
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/company/${slug}`);
        const data = await response.json();

        if (data.success) {
          setCompany(data.company);

          const savedTicketId = window.localStorage.getItem(
            getSavedTicketKey(slug)
          );

          if (savedTicketId) {
            await loadTicketStatus(Number(savedTicketId));
          }
        } else {
          setMessage(data.error ?? "Diese Warteschlange wurde nicht gefunden.");
        }
      } catch {
        setMessage("Warteschlange konnte nicht geladen werden.");
      } finally {
        setIsLoadingCompany(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadTicketStatus, slug]);

  async function createTicket() {
    setMessage("");

    if (!trimmedName) {
      setMessage("Bitte gib deinen Namen ein.");
      return;
    }

    if (isNameTooLong) {
      setMessage(`Der Name darf maximal ${MAX_NAME_LENGTH} Zeichen lang sein.`);
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`/api/company/${slug}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
        setCompany(data.company);
        window.localStorage.setItem(
          getSavedTicketKey(slug),
          String(data.ticket.id)
        );
        setName("");
      } else {
        setMessage(data.error ?? "Ticket konnte nicht erstellt werden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!ticket?.id) return;

    const ticketId = ticket.id;

    const interval = window.setInterval(() => {
      void loadTicketStatus(ticketId);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [loadTicketStatus, ticket?.id]);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col justify-center px-5 py-10">
        {isLoadingCompany && (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
            Warteschlange wird geladen...
          </p>
        )}

        {!isLoadingCompany && company && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">
              {company.name}
            </p>

            {!ticket && (
              <>
                <h1 className="mt-2 text-4xl font-bold leading-tight">
                  Ticket ziehen
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Gib deinen Namen ein. Danach siehst du deine Ticketnummer,
                  deine Position und die geschätzte Wartezeit.
                </p>

                <label className="mt-7 block text-sm font-semibold text-slate-700">
                  Dein Name
                </label>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setMessage("");
                  }}
                  className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="Vorname oder Name"
                />

                <div className="mt-2 flex items-center justify-between text-sm">
                  <p
                    className={
                      isNameTooLong ? "text-red-700" : "text-slate-500"
                    }
                  >
                    Maximal {MAX_NAME_LENGTH} Zeichen
                  </p>
                  <p className="text-slate-500">
                    {trimmedName.length}/{MAX_NAME_LENGTH}
                  </p>
                </div>

                <button
                  onClick={createTicket}
                  disabled={!canCreateTicket}
                  className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {isCreating ? "Ticket wird erstellt..." : "Ticket ziehen"}
                </button>
              </>
            )}

            {ticket && (
              <>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-800">
                    Deine Ticketnummer
                  </p>
                  <h1 className="mt-2 text-6xl font-bold tracking-normal text-blue-950">
                    #{ticket.id}
                  </h1>
                  <p className="mt-3 text-slate-600">
                    Die Anzeige aktualisiert sich automatisch.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">
                      Name
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {ticket.customer_name}
                    </p>
                  </div>

                  {ticket.status === "waiting" && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">
                        Vor dir
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {ticket.peopleBefore} Personen
                      </p>
                    </div>
                  )}
                </div>

                {ticket.status === "waiting" && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Geschätzte Wartezeit
                    </p>
                    <p className="mt-1 text-3xl font-bold">
                      {ticket.estimatedMinutes} Minuten
                    </p>
                  </div>
                )}

                {ticket.status === "called" && (
                  <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-3xl font-bold text-emerald-900">
                      Du bist dran.
                    </p>
                    <p className="mt-2 text-lg text-emerald-800">
                      Bitte gehe jetzt zum Empfang oder Behandlungsbereich.
                    </p>
                  </div>
                )}

                {ticket.status === "done" && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <p className="text-2xl font-bold text-slate-900">
                      Dein Ticket wurde abgeschlossen.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
