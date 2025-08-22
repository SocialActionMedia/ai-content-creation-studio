import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  draftId: z.string().uuid(),
  variations: z.array(z.object({ content: z.string().min(1) })).min(2),
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

  const { draftId, variations } = parsed.data;

  const { data: exp, error: expErr } = await supabase
    .from("ab_experiments")
    .insert({ draft_id: draftId, created_by: user.id })
    .select("id")
    .single();
  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 });

  const { error: varErr } = await supabase
    .from("ab_variations")
    .insert(variations.map((v) => ({ experiment_id: exp!.id, content: v.content })));
  if (varErr) return NextResponse.json({ error: varErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, experimentId: exp!.id });
}


