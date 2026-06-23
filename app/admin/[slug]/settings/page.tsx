"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const doctorCount = doctors.length;
  const hasEmptyDoctorName = useMemo(
    () => doctors.some((doctor) => !doctor.name.trim()),
    [doctors]
  );

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const [companyResponse, doctorsResponse] = await Promise.all([
          fetch(`/api/company/${slug}`),
          fetch(`/api/company/${slug}/doctors`),
        ]);
        const companyData = await companyResponse.json();
        const doctorsData = await doctorsResponse.json();

        if (companyData.success) {
          setCompany(companyData.company);
          setAddress(companyData.company.address ?? "");
          setPostalCode(companyData.company.postal_code ?? "");
          setCity(companyData.company.city ?? "");
        } else {
          setMessageType("error");
          setMessage(companyData.error ?? "Praxis wurde nicht gefunden.");
        }

        if (doctorsData.success) {
          setDoctors((doctorsData.doctors ?? []).map(mapDoctorRow));
        } else if (companyData.success) {
          setMessageType("error");
          setMessage(doctorsData.error ?? "Aerzte konnten nicht geladen werden.");
        }
      } catch {
        setMessageType("error");
        setMessage("Praxisdaten konnten nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [slug]);

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

  async function saveSettings() {
    setMessage("");

    if (!password.trim()) {
      setMessageType("error");
      setMessage("Bitte gib das Admin-Passwort ein.");
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
      setPassword("");
      setMessageType("success");
      setMessage("Einstellungen gespeichert.");
    } catch {
      setMessageType("error");
      setMessage("Verbindung fehlgeschlagen. Einstellungen wurden nicht gespeichert.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-4xl px-5 py-8">
        <a
          href={`/admin/${slug}`}
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
        >
          Zurueck zum Dashboard
        </a>

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

          {isLoading ? (
            <p className="mt-6 rounded-lg bg-slate-50 p-4 font-semibold text-slate-600">
              Einstellungen werden geladen...
            </p>
          ) : (
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
                      Jedes Ticket wird einem Arzt zugeordnet. Die Wartezeit
                      wird dann nur fuer diese Warteschlange berechnet.
                    </p>
                  </div>

                  <div className="w-full md:w-48">
                    <label className="block text-sm font-semibold text-slate-700">
                      Anzahl von Aerzten
                    </label>
                    <input
                      value={doctorCount}
                      onChange={(event) =>
                        setDoctorCount(Number(event.target.value))
                      }
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

              <section className="grid gap-4 border-t border-slate-200 pt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Admin-Passwort
                  </label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                    placeholder="Passwort zum Speichern"
                    type="password"
                  />
                </div>

                <button
                  onClick={saveSettings}
                  disabled={isSaving || !company}
                  className="h-12 rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {isSaving ? "Speichert..." : "Einstellungen speichern"}
                </button>
              </section>
            </div>
          )}

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
