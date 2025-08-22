import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ draftId: z.string().uuid(), rating: z.number().int().min(1).max(5), comment: z.string().optional() });

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { draftId, rating, comment } = parsed.data;
  const { error } = await supabase.from("feedback").insert({ draft_id: draftId, rating, comment, created_by: user.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (rating >= 4 && comment) {
    await supabase.from("learned_tips").insert({ user_id: user.id, text: comment, weight: rating });
  }
  return NextResponse.json({ ok: true });
}


