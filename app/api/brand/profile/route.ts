import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const upsertSchema = z.object({ name: z.string().min(1), tone: z.string().optional(), style_guidelines: z.string().optional() });

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name, tone, style_guidelines } = parsed.data;
  const { error } = await supabase
    .from("brand_profiles")
    .upsert({ name, tone, style_guidelines, created_by: user.id }, { onConflict: "created_by,name" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("brand_profiles").select("id, name, tone, style_guidelines, created_at");
  return NextResponse.json({ data: data ?? [] });
}


