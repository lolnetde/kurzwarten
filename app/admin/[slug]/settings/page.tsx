"use client";

import {
  clearAdminPassword,
  getSavedAdminPassword,
  saveAdminPassword,
} from "@/lib/admin-session";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
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

function createDoctorForm(index: number): DoctorForm {
  return {
    clientId: crypto.randomUUID(),
    id: "",
    name: `Arzt ${index + 1}`,
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
  const [doctors, setDoctors] = useState<DoctorForm[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingSavedLogin, setIsCheckingSavedLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const doctorCount = doctors.length;
  const hasEmptyDoctorName = useMemo(
    () => doctors.some((doctor) => !doctor.name.trim()),
    [doctors]
  );

  const loadDoctors = useCallback(async () => {
    const response = await fetch(`/api/company/${slug}/doctors`);
    const data = await response.json();

    if (data.success) {
      setDoctors((data.doctors ?? []).map(mapDoctorRow));
      return;
    }

    setMessageType("error");
    setMessage(data.error ?? "Aerzte konnten nicht geladen werden.");
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/company/${slug}`);
        const data = await response.json();

        if (data.success) {
          setCompany(data.company);
          setAddress(data.company.address ?? "");
          setPostalCode(data.company.postal_code ?? "");
          setCity(data.company.city ?? "");
        } else {
          setMessageType("error");
          setMessage(data.error ?? "Praxis wurde nicht gefunden.");
        }

        const savedPassword = getSavedAdminPassword(slug);

        if (savedPassword) {
          setIsUnlocking(true);

          const loginResponse = await fetch("/api/company-admin-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ slug, password: savedPassword }),
          });
          const loginData = await loginResponse.json();

          if (loginData.success) {
            setCompany(loginData.company);
            setAddress(loginData.company.address ?? "");
            setPostalCode(loginData.company.postal_code ?? "");
            setCity(loginData.company.city ?? "");
            setPassword(savedPassword);
            setIsUnlocked(true);
            await loadDoctors();
          } else {
            clearAdminPassword(slug);
          }
        }
      } catch {
        setMessageType("error");
        setMessage("Praxisdaten konnten nicht geladen werden.");
      } finally {
        setIsUnlocking(false);
        setIsCheckingSavedLogin(false);
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadDoctors, slug]);

  function setDoctorCount(nextCount: number) {
    const cleanCount = Math.max(0, Math.min(20, nextCount));

    setDoctors((currentDoctors) => {
      if (cleanCount <= currentDoctors.length) {
        return currentDoctors.slice(0, cleanCount);
      }

      const nextDoctors = [...currentDoctors];

      while (nextDoctors.length < cleanCount) {
        nextDoctors.push(createDoctorForm(nextDoctors.length));
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
        setCompany(data.company);
        setAddress(data.company.address ?? "");
        setPostalCode(data.company.postal_code ?? "");
        setCity(data.company.city ?? "");
        saveAdminPassword(slug, password.trim());
        setPassword(password.trim());
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

  function logoutAdmin() {
    clearAdminPassword(slug);
    setIsUnlocked(false);
    setPassword("");
    setDoctors([]);
    setMessageType("success");
    setMessage("Abgemeldet.");
  }

  async function saveSettings() {
    setMessage("");

    if (!password.trim()) {
      setMessageType("error");
      setMessage("Bitte melde dich erneut an.");
      setIsUnlocked(false);
      clearAdminPassword(slug);
      return;
    }

    if (hasEmptyDoctorName) {
      setMessageType("error");
      setMessage("Bitte gib jedem Arzt einen Namen.");
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
          password: password.trim(),
          address,
          postal_code: postalCode,
          city,
        }),
      });
      const companyData = await companyResponse.json();

      if (!companyData.success) {
        setMessageType("error");
        setMessage(
          companyData.error ?? "Praxisdaten konnten nicht gespeichert werden."
        );
        return;
      }

      const doctorsResponse = await fetch(`/api/company/${slug}/doctors`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password.trim(),
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
          doctorsData.error ?? "Aerzte konnten nicht gespeichert werden."
        );
        return;
      }

      setCompany(companyData.company);
      setAddress(companyData.company.address ?? "");
      setPostalCode(companyData.company.postal_code ?? "");
      setCity(companyData.company.city ?? "");
      setDoctors((doctorsData.doctors ?? []).map(mapDoctorRow));
      saveAdminPassword(slug, password.trim());
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
              {isLoading || isUnlocking || isCheckingSavedLogin
                ? "Wird geprueft..."
                : "Einstellungen oeffnen"}
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
            Praxis-Einstellungen
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Hier pflegst du Adresse, Anzahl der Aerzte und die Behandlungszeit
            pro Arzt. Neue Tickets werden danach einem Arzt zugeordnet.
          </p>

          <div className="mt-6 grid gap-7">
            <section className="grid gap-5">
              <div>
                <h2 className="text-xl font-bold">Praxisdaten</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Diese Angaben erscheinen in der Praxissuche.
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
            </section>

            <section className="grid gap-5 border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Aerzte und Zeiten</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Jedes Ticket wird einem Arzt zugeordnet. Die Wartezeit wird
                    dann nur fuer diese Warteschlange berechnet.
                  </p>
                </div>

                <div className="w-full md:w-48">
                  <label className="block text-sm font-semibold text-slate-700">
                    Anzahl von Aerzten
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
                  Lege mindestens einen Arzt an, damit der Empfang Tickets
                  erstellen kann.
                </div>
              )}

              <div className="grid gap-4">
                {doctors.map((doctor, index) => (
                  <div
                    key={doctor.clientId}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="font-bold">Arzt {index + 1}</p>
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
                          placeholder="z. B. Dr. Meyer"
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

            <button
              onClick={saveSettings}
              disabled={isSaving || !company}
              className="h-12 rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isSaving ? "Speichert..." : "Einstellungen speichern"}
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
