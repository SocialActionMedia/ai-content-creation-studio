import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ draftId: z.string().uuid(), versionId: z.string().uuid() });

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: version } = await supabase.from("content_versions").select("content").eq("id", parsed.data.versionId).single();
  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const { error } = await supabase.from("content_drafts").update({ content: version.content, updated_at: new Date().toISOString() }).eq("id", parsed.data.draftId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


