import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

function isMissingDisclaimerError(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("wait_time_disclaimer") ?? false;
}

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  let { data: company, error } = await supabase
    .from("companies")
    .select("id, name, slug, address, postal_code, city, wait_time_disclaimer")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (isMissingDisclaimerError(error)) {
    const fallbackResult = await supabase
      .from("companies")
      .select("id, name, slug, address, postal_code, city")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    company = fallbackResult.data
      ? { ...fallbackResult.data, wait_time_disclaimer: null }
      : null;
    error = fallbackResult.error;
  }

  if (error || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, company });
}
