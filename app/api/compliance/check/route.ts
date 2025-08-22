import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  content: z.string().min(1),
  industry: z.string().optional(),
  draftId: z.string().uuid().optional(),
});

async function loadRules(supabase: ReturnType<typeof getSupabaseServerClient>, industry?: string) {
  let query = supabase
    .from("compliance_rules")
    .select("id, name, description, pattern, enabled, blocking, severity, category, industry")
    .eq("enabled", true);
  if (industry) {
    query = query.or(`industry.is.null,industry.eq.${industry}`);
  }
  const { data } = await query;
  type RuleRow = { id: string; name: string; description: string | null; pattern: string; blocking?: boolean; severity?: string; category?: string | null };
  return (
    (data as RuleRow[] | null)?.map((r) => ({
      id: r.id as string,
      description: (r.description ?? r.name) as string,
      pattern: new RegExp(String(r.pattern), "i"),
      blocking: Boolean(r.blocking),
      severity: (r.severity ?? "medium") as string,
      category: (r.category ?? null) as string | null,
    })) ?? []
  );
}

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

  const rules = await loadRules(supabase, parsed.data.industry);
  const violations = rules
    .filter((r) => r.pattern.test(parsed.data.content))
    .map(({ id, description, blocking, severity, category }) => ({ id, description, blocking, severity, category }));

  // record audit
  await supabase.from("compliance_audits").insert({
    draft_id: parsed.data.draftId ?? null,
    user_id: user.id,
    industry: parsed.data.industry ?? null,
    violations,
  });

  const hasBlocking = violations.some((v) => v.blocking);
  return NextResponse.json({ violations, hasBlocking });
}


