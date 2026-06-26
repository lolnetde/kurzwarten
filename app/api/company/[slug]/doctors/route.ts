import { requireAdminSession } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

type CompanyRow = {
  id: string;
};

type DoctorInput = {
  id?: unknown;
  name?: unknown;
  treatment_time_min?: unknown;
  treatment_time_max?: unknown;
};

const MAX_DOCTORS = 20;
const MAX_DOCTOR_NAME_LENGTH = 80;
const MAX_TREATMENT_MINUTES = 240;

async function getAuthorizedCompany(request: Request, slug: string) {
  const auth = await requireAdminSession(request, slug);

  if (!auth.ok) {
    return { company: null, response: auth.response };
  }

  const { data, error } = await supabaseServer
    .from("companies")
    .select("id")
    .eq("id", auth.session.companyId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return {
      company: null,
      response: NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      ),
    };
  }

  if (!data) {
    return {
      company: null,
      response: NextResponse.json(
        { success: false, error: "Unternehmen wurde nicht gefunden." },
        { status: 404 }
      ),
    };
  }

  return { company: data as CompanyRow, response: null };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const { company, response } = await getAuthorizedCompany(request, slug);

  if (response) {
    return response;
  }

  const { data: doctors, error } = await supabaseServer
    .from("doctors")
    .select("id, name, treatment_time_min, treatment_time_max, active")
    .eq("company_id", company.id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, doctors: doctors ?? [] });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  let body: { doctors?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungueltige Anfrage" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.doctors)) {
    return NextResponse.json(
      { success: false, error: "Team-Eintraege konnten nicht gelesen werden." },
      { status: 400 }
    );
  }

  if (body.doctors.length > MAX_DOCTORS) {
    return NextResponse.json(
      {
        success: false,
        error: `Maximal ${MAX_DOCTORS} Team-Eintraege sind erlaubt.`,
      },
      { status: 400 }
    );
  }

  const { company, response } = await getAuthorizedCompany(request, slug);

  if (response) {
    return response;
  }

  const cleanedDoctors = (body.doctors as DoctorInput[])
    .map((doctor) => {
      const id = typeof doctor.id === "string" ? doctor.id.trim() : "";
      const name = typeof doctor.name === "string" ? doctor.name.trim() : "";
      const treatmentTimeMin = Number(doctor.treatment_time_min);
      const rawTreatmentTimeMax = Number(doctor.treatment_time_max);
      const treatmentTimeMax =
        Number.isFinite(rawTreatmentTimeMax) && rawTreatmentTimeMax > 0
          ? rawTreatmentTimeMax
          : treatmentTimeMin;

      return {
        id,
        name,
        treatment_time_min: Math.round(treatmentTimeMin),
        treatment_time_max: Math.round(treatmentTimeMax),
      };
    })
    .filter((doctor) => doctor.name);

  for (const doctor of cleanedDoctors) {
    if (doctor.name.length > MAX_DOCTOR_NAME_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Namen duerfen maximal ${MAX_DOCTOR_NAME_LENGTH} Zeichen lang sein.`,
        },
        { status: 400 }
      );
    }

    if (
      doctor.treatment_time_min < 1 ||
      doctor.treatment_time_max < doctor.treatment_time_min ||
      doctor.treatment_time_max > MAX_TREATMENT_MINUTES
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Behandlungszeiten muessen zwischen 1 und 240 Minuten liegen. Die zweite Zahl darf nicht kleiner sein.",
        },
        { status: 400 }
      );
    }
  }

  const { data: existingDoctors, error: existingError } = await supabaseServer
    .from("doctors")
    .select("id")
    .eq("company_id", company.id);

  if (existingError) {
    return NextResponse.json(
      { success: false, error: existingError.message },
      { status: 500 }
    );
  }

  const keptIds = cleanedDoctors
    .map((doctor) => doctor.id)
    .filter((id): id is string => Boolean(id));
  const existingIds = ((existingDoctors as { id: string }[] | null) ?? []).map(
    (doctor) => doctor.id
  );
  const removedIds = existingIds.filter((id) => !keptIds.includes(id));

  if (removedIds.length > 0) {
    const { error } = await supabaseServer
      .from("doctors")
      .update({ active: false })
      .eq("company_id", company.id)
      .in("id", removedIds);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }

  for (const doctor of cleanedDoctors) {
    if (doctor.id) {
      const { error } = await supabaseServer
        .from("doctors")
        .update({
          name: doctor.name,
          treatment_time_min: doctor.treatment_time_min,
          treatment_time_max: doctor.treatment_time_max,
          active: true,
        })
        .eq("company_id", company.id)
        .eq("id", doctor.id);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabaseServer.from("doctors").insert({
        company_id: company.id,
        name: doctor.name,
        treatment_time_min: doctor.treatment_time_min,
        treatment_time_max: doctor.treatment_time_max,
        active: true,
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }
  }

  const { data: doctors, error } = await supabaseServer
    .from("doctors")
    .select("id, name, treatment_time_min, treatment_time_max, active")
    .eq("company_id", company.id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, doctors: doctors ?? [] });
}
