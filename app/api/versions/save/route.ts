import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ draftId: z.string().uuid(), content: z.string().min(1), parentVersionId: z.string().uuid().optional(), updatedAt: z.string().datetime().optional() });

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // concurrency guard: compare updated_at if provided
  if (parsed.data.updatedAt) {
    const { data: draft } = await supabase.from("content_drafts").select("updated_at").eq("id", parsed.data.draftId).single();
    if (draft && new Date(draft.updated_at).toISOString() !== new Date(parsed.data.updatedAt).toISOString()) {
      return NextResponse.json({ error: "Draft has been updated by someone else." }, { status: 409 });
    }
  }

  const { error } = await supabase.from("content_versions").insert({
    draft_id: parsed.data.draftId,
    content: parsed.data.content,
    created_by: user.id,
    parent_version_id: parsed.data.parentVersionId ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // update draft updated_at
  await supabase.from("content_drafts").update({ updated_at: new Date().toISOString(), content: parsed.data.content }).eq("id", parsed.data.draftId);
  return NextResponse.json({ ok: true });
}


