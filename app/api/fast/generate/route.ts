import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  format: z.enum(["blog","ad","email","script","social"]),
  prompt: z.string().min(1),
  brand: z.string().optional(),
  platform: z.string().optional(),
});

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // 1) generate
  const genRes = await fetch(new URL("/api/ai/generate", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!genRes.ok) return NextResponse.json({ error: await genRes.json() }, { status: 500 });
  const gen = await genRes.json();

  const platform = parsed.data.platform ?? "LinkedIn";
  // 2) optimize
  const optRes = await fetch(new URL("/api/optimize/apply", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draftId: gen.draftId, platform, format: parsed.data.format }),
  });
  const opt = optRes.ok ? await optRes.json() : { optimized: gen.content };

  // 3) compliance
  const compRes = await fetch(new URL("/api/compliance/check", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: opt.optimized ?? gen.content }),
  });
  const comp = compRes.ok ? await compRes.json() : { violations: [] };

  return NextResponse.json({
    draftId: gen.draftId,
    content: opt.optimized ?? gen.content,
    violations: comp.violations ?? [],
  });
}


