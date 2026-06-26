"use client";

import {
  getCurrentAdminSession,
  logoutAdminSession,
} from "@/lib/admin-session";
import {
  clearAdminPortalCache,
  getAdminPortalCache,
  setCachedAdminCompany,
  setCachedAdminDoctors,
  type CachedAdminCompany,
  type CachedAdminDoctor,
} from "@/lib/admin-portal-cache";
import { ButtonSpinner, PanelSkeleton } from "@/components/LoadingStates";
import {
  DEFAULT_WAIT_TIME_DISCLAIMER,
  MAX_WAIT_TIME_DISCLAIMER_LENGTH,
} from "@/lib/wait-time-disclaimer";
import {
  COMPANY_ENVIRONMENTS,
  DEFAULT_COMPANY_ENVIRONMENT,
  getCompanyEnvironmentCopy,
  normalizeCompanyEnvironment,
  type CompanyEnvironment,
} from "@/lib/company-environments";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  wait_time_disclaimer: string | null;
  environment_type: string | null;
};

type DoctorRow = {
  id: string;
  name: string;
  treatment_time_min: number;
  treatment_time_max: number;
};

type DoctorForm = {
  clientId: string;
  id: string;
  name: string;
  mode: "fixed" | "range";
  treatmentTimeMin: string;
  treatmentTimeMax: string;
};

function createDoctorForm(index: number, workerSingular = "Mitarbeiter"): DoctorForm {
  return {
    clientId: crypto.randomUUID(),
    id: "",
    name: `${workerSingular} ${index + 1}`,
    mode: "fixed",
    treatmentTimeMin: "10",
    treatmentTimeMax: "10",
  };
}

function mapDoctorRow(doctor: DoctorRow): DoctorForm {
  const isRange = doctor.treatment_time_max !== doctor.treatment_time_min;

  return {
    clientId: doctor.id,
    id: doctor.id,
    name: doctor.name,
    mode: isRange ? "range" : "fixed",
    treatmentTimeMin: String(doctor.treatment_time_min),
    treatmentTimeMax: String(doctor.treatment_time_max),
  };
}

export default function CompanySettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [waitTimeDisclaimer, setWaitTimeDisclaimer] = useState(
    DEFAULT_WAIT_TIME_DISCLAIMER
  );
  const [environmentType, setEnvironmentType] = useState<CompanyEnvironment>(
    DEFAULT_COMPANY_ENVIRONMENT
  );
  const [doctors, setDoctors] = useState<DoctorForm[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingSavedLogin, setIsCheckingSavedLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const doctorCount = doctors.length;
  const environmentCopy = getCompanyEnvironmentCopy(environmentType);
  const hasEmptyDoctorName = useMemo(
    () => doctors.some((doctor) => !doctor.name.trim()),
    [doctors]
  );

  const applyCompany = useCallback((nextCompany: CachedAdminCompany) => {
    setCompany(nextCompany as Company);
    setAddress(nextCompany.address ?? "");
    setPostalCode(nextCompany.postal_code ?? "");
    setCity(nextCompany.city ?? "");
    setWaitTimeDisclaimer(
      nextCompany.wait_time_disclaimer ?? DEFAULT_WAIT_TIME_DISCLAIMER
    );
    setEnvironmentType(
      normalizeCompanyEnvironment(nextCompany.environment_type)
    );
  }, []);

  const applyDoctorRows = useCallback((doctorRows: CachedAdminDoctor[]) => {
    setDoctors(doctorRows.map(mapDoctorRow));
  }, []);

  const loadDoctors = useCallback(async () => {
    const response = await fetch(`/api/company/${slug}/doctors`);
    const data = await response.json();

    if (data.success) {
      const loadedDoctors = data.doctors ?? [];
      applyDoctorRows(loadedDoctors);
      setCachedAdminDoctors(slug, loadedDoctors);
      return;
    }

    setMessageType("error");
    setMessage(data.error ?? "Team konnte nicht geladen werden.");
  }, [applyDoctorRows, slug]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const cachedPortal = getAdminPortalCache(slug);
      const hasCachedDoctors = Boolean(cachedPortal?.doctors);

      if (cachedPortal?.company) {
        applyCompany(cachedPortal.company);
        setIsUnlocked(true);
        setIsLoading(false);
      }

      if (cachedPortal?.doctors) {
        applyDoctorRows(cachedPortal.doctors);
      }

      try {
        setIsUnlocking(!cachedPortal?.company);

        const sessionData = await getCurrentAdminSession(slug);

        if (sessionData.success) {
          applyCompany(sessionData.company);
          setCachedAdminCompany(slug, sessionData.company);
          setPassword("");
          setIsUnlocked(true);

          if (!hasCachedDoctors) {
            await loadDoctors();
          }
        } else {
          clearAdminPortalCache(slug);
          setIsUnlocked(false);
          setDoctors([]);

          const response = await fetch(`/api/company/${slug}`);
          const data = await response.json();

          if (data.success) {
            applyCompany(data.company);
          } else {
            setMessageType("error");
            setMessage(data.error ?? "Einrichtung wurde nicht gefunden.");
          }
        }
      } catch {
        setMessageType("error");
        setMessage("Einstellungen konnten nicht geladen werden.");
      } finally {
        setIsUnlocking(false);
        setIsCheckingSavedLogin(false);
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [applyCompany, applyDoctorRows, loadDoctors, slug]);

  function setDoctorCount(nextCount: number) {
    const cleanCount = Math.max(0, Math.min(20, nextCount));

    setDoctors((currentDoctors) => {
      if (cleanCount <= currentDoctors.length) {
        return currentDoctors.slice(0, cleanCount);
      }

      const nextDoctors = [...currentDoctors];

      while (nextDoctors.length < cleanCount) {
        nextDoctors.push(
          createDoctorForm(nextDoctors.length, environmentCopy.workerSingular)
        );
      }

      return nextDoctors;
    });
  }

  function updateDoctor(clientId: string, changes: Partial<DoctorForm>) {
    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) =>
        doctor.clientId === clientId ? { ...doctor, ...changes } : doctor
      )
    );
  }

  function removeDoctor(clientId: string) {
    setDoctors((currentDoctors) =>
      currentDoctors.filter((doctor) => doctor.clientId !== clientId)
    );
  }

  async function unlockSettings() {
    setMessage("");

    if (!password.trim()) {
      setMessageType("error");
      setMessage("Bitte gib das Admin-Passwort ein.");
      return;
    }

    setIsUnlocking(true);

    try {
      const response = await fetch("/api/company-admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug, password: password.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        applyCompany(data.company);
        setCachedAdminCompany(slug, data.company);
        setPassword("");
        setIsUnlocked(true);
        await loadDoctors();
      } else {
        setMessageType("error");
        setMessage(data.error ?? "Login fehlgeschlagen.");
      }
    } catch {
      setMessageType("error");
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsUnlocking(false);
    }
  }

  async function logoutAdmin() {
    await logoutAdminSession(slug);
    setIsUnlocked(false);
    setPassword("");
    setDoctors([]);
    setMessageType("success");
    setMessage("Abgemeldet.");
  }

  async function saveSettings() {
    setMessage("");

    if (hasEmptyDoctorName) {
      setMessageType("error");
      setMessage(`Bitte gib jedem ${environmentCopy.workerSingular} einen Namen.`);
      return;
    }

    const normalizedWaitTimeDisclaimer =
      waitTimeDisclaimer.trim() || DEFAULT_WAIT_TIME_DISCLAIMER;

    if (
      normalizedWaitTimeDisclaimer.length > MAX_WAIT_TIME_DISCLAIMER_LENGTH
    ) {
      setMessageType("error");
      setMessage(
        `Der Hinweis darf maximal ${MAX_WAIT_TIME_DISCLAIMER_LENGTH} Zeichen lang sein.`
      );
      return;
    }

    setIsSaving(true);

    try {
      const companyResponse = await fetch(`/api/company/${slug}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          postal_code: postalCode,
          city,
          wait_time_disclaimer: normalizedWaitTimeDisclaimer,
          environment_type: environmentType,
        }),
      });
      const companyData = await companyResponse.json();

      if (!companyData.success) {
        setMessageType("error");
        setMessage(
          companyData.error ?? "Daten konnten nicht gespeichert werden."
        );
        return;
      }

      const doctorsResponse = await fetch(`/api/company/${slug}/doctors`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctors: doctors.map((doctor) => {
            const treatmentTimeMin = Number(doctor.treatmentTimeMin);
            const treatmentTimeMax =
              doctor.mode === "range"
                ? Number(doctor.treatmentTimeMax)
                : treatmentTimeMin;

            return {
              id: doctor.id || undefined,
              name: doctor.name,
              treatment_time_min: treatmentTimeMin,
              treatment_time_max: treatmentTimeMax,
            };
          }),
        }),
      });
      const doctorsData = await doctorsResponse.json();

      if (!doctorsData.success) {
        setMessageType("error");
        setMessage(
          doctorsData.error ?? "Team konnte nicht gespeichert werden."
        );
        return;
      }

      applyCompany(companyData.company);
      setCachedAdminCompany(slug, companyData.company);

      const savedDoctors = doctorsData.doctors ?? [];
      applyDoctorRows(savedDoctors);
      setCachedAdminDoctors(slug, savedDoctors);
      setMessageType("success");
      setMessage("Einstellungen gespeichert.");
    } catch {
      setMessageType("error");
      setMessage("Verbindung fehlgeschlagen. Einstellungen wurden nicht gespeichert.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
          {(isLoading || isCheckingSavedLogin) && !company ? (
            <PanelSkeleton />
          ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">
              {company?.name ?? "KurzWarten"}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight">
              Einstellungen oeffnen
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {isCheckingSavedLogin
                ? "Gespeicherte Anmeldung wird geprueft."
                : "Gib das Admin-Passwort ein, um die Einstellungen zu bearbeiten."}
            </p>

            <label className="mt-7 block text-sm font-semibold text-slate-700">
              Admin-Passwort
            </label>
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && password.trim()) {
                  event.preventDefault();
                  void unlockSettings();
                }
              }}
              className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
              disabled={
                isLoading ||
                isCheckingSavedLogin ||
                !company ||
                isUnlocking
              }
              placeholder="Passwort"
              type="password"
            />

            <button
              onClick={unlockSettings}
              disabled={
                isLoading ||
                isCheckingSavedLogin ||
                !company ||
                !password.trim() ||
                isUnlocking
              }
              className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isLoading || isUnlocking || isCheckingSavedLogin ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Wird geprüft...
                </span>
              ) : (
                "Einstellungen öffnen"
              )}
            </button>

            <a
              href={`/admin/${slug}`}
              className="mt-3 block rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50"
            >
              Zurueck zum Dashboard
            </a>

            {message && (
              <p
                className={`mt-4 rounded-lg p-3 font-semibold ${
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            )}
          </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-wrap gap-3">
          <a
            href={`/admin/${slug}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Zurueck zum Dashboard
          </a>
          <button
            onClick={logoutAdmin}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
          >
            Abmelden
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            {company?.name ?? "KurzWarten"}
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">
            {environmentCopy.settingsTitle}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Hier pflegst du Adresse, Teamgröße und die durchschnittliche
            Bearbeitungszeit. Neue Tickets werden danach passend zugeordnet.
          </p>

          <div className="mt-6 grid gap-7">
            <section className="grid gap-5">
              <div>
                <h2 className="text-xl font-bold">
                  {environmentCopy.dataTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Diese Angaben erscheinen in der Suche.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Strasse und Hausnummer
                </label>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                  placeholder="z. B. Musterstrasse 12"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Postleitzahl
                  </label>
                  <input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                    placeholder="z. B. 50667"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Stadt oder Ort
                  </label>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                    placeholder="z. B. Koeln"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Hinweis zu Wartezeiten
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {waitTimeDisclaimer.trim().length}/
                    {MAX_WAIT_TIME_DISCLAIMER_LENGTH}
                  </span>
                </div>
                <textarea
                  value={waitTimeDisclaimer}
                  onChange={(event) => setWaitTimeDisclaimer(event.target.value)}
                  className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 leading-6 text-slate-950"
                  maxLength={MAX_WAIT_TIME_DISCLAIMER_LENGTH}
                  placeholder={DEFAULT_WAIT_TIME_DISCLAIMER}
                />
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Dieser Text wird Kundinnen und Kunden direkt bei ihrem Ticket
                  angezeigt.
                </p>
              </div>
            </section>

            <section className="grid gap-5 border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {environmentCopy.workerSectionTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Jedes Ticket wird einem Eintrag zugeordnet. Die Wartezeit
                    wird dann nur für diese Warteschlange berechnet.
                  </p>
                </div>

                <div className="w-full md:w-48">
                  <label className="block text-sm font-semibold text-slate-700">
                    {environmentCopy.workerCountLabel}
                  </label>
                  <input
                    value={doctorCount}
                    onChange={(event) => setDoctorCount(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                    min={0}
                    max={20}
                    type="number"
                  />
                </div>
              </div>

              {doctors.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                  Lege mindestens einen Eintrag an, damit Tickets erstellt
                  werden können.
                </div>
              )}

              <div className="grid gap-4">
                {doctors.map((doctor, index) => (
                  <div
                    key={doctor.clientId}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="font-bold">
                        {environmentCopy.workerSingular} {index + 1}
                      </p>
                      <button
                        onClick={() => removeDoctor(doctor.clientId)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Entfernen
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px_1fr]">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">
                          Name
                        </label>
                        <input
                          value={doctor.name}
                          onChange={(event) =>
                            updateDoctor(doctor.clientId, {
                              name: event.target.value,
                            })
                          }
                          className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                          placeholder={environmentCopy.workerNamePlaceholder}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700">
                          Zeitmodell
                        </label>
                        <select
                          value={doctor.mode}
                          onChange={(event) =>
                            updateDoctor(doctor.clientId, {
                              mode: event.target.value as "fixed" | "range",
                              treatmentTimeMax:
                                event.target.value === "fixed"
                                  ? doctor.treatmentTimeMin
                                  : doctor.treatmentTimeMax,
                            })
                          }
                          className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                        >
                          <option value="fixed">Feste Zeit</option>
                          <option value="range">Zeitspanne</option>
                        </select>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">
                            Minuten
                          </label>
                          <input
                            value={doctor.treatmentTimeMin}
                            onChange={(event) =>
                              updateDoctor(doctor.clientId, {
                                treatmentTimeMin: event.target.value,
                                treatmentTimeMax:
                                  doctor.mode === "fixed"
                                    ? event.target.value
                                    : doctor.treatmentTimeMax,
                              })
                            }
                            className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                            min={1}
                            max={240}
                            type="number"
                          />
                        </div>

                        {doctor.mode === "range" && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">
                              Bis Minuten
                            </label>
                            <input
                              value={doctor.treatmentTimeMax}
                              onChange={(event) =>
                                updateDoctor(doctor.clientId, {
                                  treatmentTimeMax: event.target.value,
                                })
                              }
                              className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                              min={1}
                              max={240}
                              type="number"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 border-t border-slate-200 pt-6">
              <div>
                <h2 className="text-xl font-bold">Bereich</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Diese Auswahl passt die Begriffe in Adminbereich,
                  Kundenseite und Einstellungen an.
                </p>
              </div>

              <select
                value={environmentType}
                onChange={(event) => {
                  setEnvironmentType(
                    normalizeCompanyEnvironment(event.target.value)
                  );
                  setMessage("");
                }}
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
              >
                {COMPANY_ENVIRONMENTS.map((environment) => (
                  <option key={environment.id} value={environment.id}>
                    {environment.label}
                  </option>
                ))}
              </select>
            </section>

            <button
              onClick={saveSettings}
              disabled={isSaving || !company}
              className="h-12 rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isSaving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Speichert...
                </span>
              ) : (
                "Einstellungen speichern"
              )}
            </button>
          </div>

          {message && (
            <p
              className={`mt-5 rounded-lg p-3 font-semibold ${
                messageType === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
