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
  ticket_number: number;
  ticket_day: string;
  customer_name: string;
  status: string;
  doctor: {
    id: string;
    name: string;
    treatment_time_min: number;
    treatment_time_max: number;
  } | null;
  peopleBefore: number;
  estimatedMinutes: number;
  estimatedMinutesMin: number;
  estimatedMinutesMax: number;
};

function getSavedTicketKey(slug: string) {
  return `kurzwarten-ticket-${slug}`;
}

export default function CompanyWartenPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [message, setMessage] = useState("");
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

  const trimmedTicketNumber = ticketNumber.trim();
  const parsedTicketNumber = Number(trimmedTicketNumber);
  const canOpenTicket =
    Number.isInteger(parsedTicketNumber) && parsedTicketNumber > 0 && !isLoadingTicket;

  const loadTicketStatus = useCallback(async (ticketId: number) => {
    try {
      const response = await fetch(`/api/company/${slug}/ticket/${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
        setCompany(data.company);
        setMessage("");

        if (data.ticket.status === "done" || data.ticket.status === "deleted") {
          window.localStorage.removeItem(getSavedTicketKey(slug));
        }

        return true;
      }

      window.localStorage.removeItem(getSavedTicketKey(slug));
      setTicket(null);
      setMessage(data.error ?? "Ticket wurde nicht gefunden.");
      return false;
    } catch {
      setMessage("Live-Status konnte gerade nicht aktualisiert werden.");
      return false;
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

  async function openTicket() {
    setMessage("");

    if (!canOpenTicket) {
      setMessage("Bitte gib deine Ticketnummer ein.");
      return;
    }

    setIsLoadingTicket(true);

    try {
      const foundTicket = await loadTicketStatus(parsedTicketNumber);

      if (foundTicket) {
        window.localStorage.setItem(
          getSavedTicketKey(slug),
          String(parsedTicketNumber)
        );
        setTicketNumber("");
      }
    } finally {
      setIsLoadingTicket(false);
    }
  }

  function forgetTicket() {
    window.localStorage.removeItem(getSavedTicketKey(slug));
    setTicket(null);
    setTicketNumber("");
    setMessage("");
  }

  useEffect(() => {
    if (!ticket?.ticket_number) return;
    if (ticket.status === "done" || ticket.status === "deleted") return;

    const ticketNumber = ticket.ticket_number;

    const interval = window.setInterval(() => {
      void loadTicketStatus(ticketNumber);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [loadTicketStatus, ticket?.ticket_number, ticket?.status]);

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
                  Ticketnummer eingeben
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Gib die Nummer ein, die du in der Praxis erhalten hast. Danach
                  siehst du deine Position und den Live-Status.
                </p>

                <label className="mt-7 block text-sm font-semibold text-slate-700">
                  Deine Ticketnummer
                </label>
                <input
                  value={ticketNumber}
                  onChange={(event) => {
                    setTicketNumber(event.target.value.replace(/\D/g, ""));
                    setMessage("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canOpenTicket) {
                      event.preventDefault();
                      void openTicket();
                    }
                  }}
                  className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
                  inputMode="numeric"
                  placeholder="z. B. 42"
                />

                <button
                  onClick={openTicket}
                  disabled={!canOpenTicket}
                  className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {isLoadingTicket ? "Ticket wird gesucht..." : "Ticket anzeigen"}
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
                    #{ticket.ticket_number}
                  </h1>
                  <p className="mt-3 text-slate-600">
                    Die Anzeige aktualisiert sich automatisch.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">
                      Status
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {ticket.status === "called"
                        ? "Aufgerufen"
                        : ticket.status === "done"
                          ? "Erledigt"
                          : ticket.status === "deleted"
                            ? "Gelöscht"
                          : "Wartet"}
                    </p>
                  </div>

                  {ticket.doctor && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">
                        Zugeordnet
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {ticket.doctor.name}
                      </p>
                    </div>
                  )}

                  {ticket.status === "waiting" && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">
                        Vor dir bei diesem Arzt
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
                      {ticket.estimatedMinutesMin === ticket.estimatedMinutesMax
                        ? `${ticket.estimatedMinutesMin} Minuten`
                        : `${ticket.estimatedMinutesMin}-${ticket.estimatedMinutesMax} Minuten`}
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

                {ticket.status === "deleted" && (
                  <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5">
                    <p className="text-2xl font-bold text-red-900">
                      Ihr Ticket wurde gelöscht.
                    </p>
                    <p className="mt-2 text-lg leading-8 text-red-800">
                      Bitte frage in der Praxis nach oder gib eine andere
                      Ticketnummer ein.
                    </p>
                  </div>
                )}

                <button
                  onClick={forgetTicket}
                  className="mt-5 h-12 w-full rounded-lg border border-slate-300 bg-white px-6 font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Andere Ticketnummer eingeben
                </button>
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
