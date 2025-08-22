import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  draftId: z.string().uuid(),
  platform: z.string(),
  format: z.string(),
});

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { draftId, platform, format } = parsed.data;

  const { data: config } = await supabase
    .from("optimization_configs")
    .select("rules")
    .eq("platform", platform)
    .eq("format", format)
    .maybeSingle();

  const { data: draft } = await supabase
    .from("content_drafts")
    .select("id, content")
    .eq("id", draftId)
    .single();

  type Rules = { maxLength?: number } | null;
  const rules: Rules = (config?.rules as unknown as Rules) || null;
  let optimized = draft?.content ?? "";
  if (rules && typeof rules.maxLength === "number") {
    optimized = optimized.slice(0, rules.maxLength);
  }

  return NextResponse.json({ optimized });
}


