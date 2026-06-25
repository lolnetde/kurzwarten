import { supabase } from "@/lib/supabase";
import { getCompanyEnvironmentCopy } from "@/lib/company-environments";
import { NextResponse } from "next/server";

function isMissingEnvironmentError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("environment_type") ?? false;
}

type CompanySearchRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  environment_type: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ success: true, companies: [] });
  }

  const searchParts = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, address, postal_code, city, environment_type")
    .order("name", { ascending: true })
    .limit(100);

  if (isMissingEnvironmentError(error)) {
    const fallbackResult = await supabase
      .from("companies")
      .select("id, name, slug, address, postal_code, city")
      .order("name", { ascending: true })
      .limit(100);

    data =
      fallbackResult.data?.map((company) => ({
        ...company,
        environment_type: null,
      })) ?? null;
    error = fallbackResult.error;
  }

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  const companies = ((data as CompanySearchRow[] | null) ?? [])
    .filter((company) => {
      const environmentCopy = getCompanyEnvironmentCopy(company.environment_type);
      const searchableText = [
        company.name,
        company.address,
        company.postal_code,
        company.city,
        environmentCopy.label,
        environmentCopy.organizationLabel,
        environmentCopy.workerSingular,
        environmentCopy.workerPlural,
        environmentCopy.customerGroup,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchParts.every((part) => searchableText.includes(part));
    })
    .slice(0, 6);

  return NextResponse.json({ success: true, companies });
}
