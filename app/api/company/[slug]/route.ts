import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (error || !company) {
    return NextResponse.json(
      { success: false, error: "Unternehmen nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, company });
}
