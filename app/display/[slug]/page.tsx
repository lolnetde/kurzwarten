"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getCompanyEnvironmentCopy } from "@/lib/company-environments";

type DisplayTicket = {
  id: number;
  ticket_number: number;
  status: "waiting" | "called";
  queue_position: number | null;
};

type DisplayColumn = {
  id: string;
  name: string;
  called: DisplayTicket[];
  waiting: DisplayTicket[];
};

type DisplayCompany = {
  name: string;
  slug: string;
  environment_type: string | null;
};

type DisplayData = {
  company: DisplayCompany;
  columns: DisplayColumn[];
  updated_at: string;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function TicketBadge({
  ticket,
  variant,
}: {
  ticket: DisplayTicket;
  variant: "called" | "waiting";
}) {
  const isCalled = variant === "called";

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isCalled
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-slate-50 text-slate-950"
      }`}
    >
      <p
        className={`text-sm font-bold uppercase tracking-normal ${
          isCalled ? "text-amber-800" : "text-slate-500"
        }`}
      >
        {isCalled ? "Aufgerufen" : "Wartet"}
      </p>
      <p
        className={`mt-1 font-bold leading-none ${
          isCalled ? "text-6xl" : "text-4xl"
        }`}
      >
        #{ticket.ticket_number}
      </p>
    </div>
  );
}

export default function CompanyDisplayPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const environmentCopy = getCompanyEnvironmentCopy(
    displayData?.company.environment_type
  );
  const totalWaiting = useMemo(
    () =>
      displayData?.columns.reduce(
        (total, column) => total + column.waiting.length,
        0
      ) ?? 0,
    [displayData]
  );
  const totalCalled = useMemo(
    () =>
      displayData?.columns.reduce(
        (total, column) => total + column.called.length,
        0
      ) ?? 0,
    [displayData]
  );

  const loadDisplay = useCallback(async () => {
    try {
      const response = await fetch(`/api/company/${slug}/display`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.success) {
        setDisplayData(data);
        setMessage("");
      } else {
        setMessage(data.error ?? "Display konnte nicht geladen werden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Display konnte nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadDisplay();
    }, 0);
    const interval = window.setInterval(() => {
      void loadDisplay();
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadDisplay]);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-blue-700">
              Öffentliche Warteschlangen-Anzeige
            </p>
            <h1 className="mt-2 text-5xl font-bold leading-tight md:text-7xl">
              {displayData?.company.name ?? "KurzWarten Display"}
            </h1>
            <p className="mt-3 max-w-3xl text-xl leading-8 text-slate-600">
              Es werden nur Ticketnummern und öffentliche Statusinformationen
              angezeigt.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Wartend</p>
              <p className="mt-1 text-4xl font-bold">{totalWaiting}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-amber-800">
                Aufgerufen
              </p>
              <p className="mt-1 text-4xl font-bold text-amber-950">
                {totalCalled}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Aktualisiert
              </p>
              <p className="mt-2 text-2xl font-bold">
                {displayData ? formatTime(displayData.updated_at) : "--:--"}
              </p>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="mt-8 grid flex-1 gap-5 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="min-h-96 animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-7 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-24 rounded bg-slate-100" />
                <div className="mt-5 grid gap-3">
                  <div className="h-16 rounded bg-slate-100" />
                  <div className="h-16 rounded bg-slate-100" />
                  <div className="h-16 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && message && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-xl font-bold text-red-800">
            {message}
          </div>
        )}

        {!isLoading && displayData && (
          <>
            <div className="mt-6 grid flex-1 gap-5 xl:grid-cols-3">
              {displayData.columns.map((column) => {
                const calledTickets = column.called.slice(0, 2);
                const waitingTickets = column.waiting.slice(0, 10);

                return (
                  <section
                    key={column.id}
                    className="flex min-h-[32rem] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="border-b border-slate-200 pb-4">
                      <p className="text-sm font-bold uppercase tracking-normal text-blue-700">
                        {environmentCopy.ticketAssignmentLabel}
                      </p>
                      <h2 className="mt-1 text-3xl font-bold leading-tight">
                        {column.name}
                      </h2>
                    </div>

                    <div className="mt-5">
                      {calledTickets.length > 0 ? (
                        <div className="grid gap-3">
                          {calledTickets.map((ticket) => (
                            <TicketBadge
                              key={ticket.id}
                              ticket={ticket}
                              variant="called"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-slate-500">
                          Aktuell kein Ticket aufgerufen.
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex-1">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-xl font-bold">Wartefolge</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                          {column.waiting.length} wartend
                        </span>
                      </div>

                      {waitingTickets.length > 0 ? (
                        <div className="grid gap-2">
                          {waitingTickets.map((ticket, index) => (
                            <div
                              key={ticket.id}
                              className="grid grid-cols-[4rem_1fr] items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <span className="text-xl font-bold text-slate-500">
                                {index + 1}.
                              </span>
                              <span className="text-right text-4xl font-bold">
                                #{ticket.ticket_number}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-slate-500">
                          Keine wartenden Tickets.
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {totalWaiting === 0 && totalCalled === 0 && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 text-center text-xl font-semibold text-slate-600 shadow-sm">
                Aktuell gibt es keine wartenden oder aufgerufenen Tickets.
              </div>
            )}
          </>
        )}

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-500">
          <span>Automatische Aktualisierung alle 5 Sekunden</span>
          <Link href="/display" className="hover:text-slate-950">
            Anderes Display öffnen
          </Link>
        </footer>
      </section>
    </main>
  );
}
