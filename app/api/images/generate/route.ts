import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  prompt: z.string().min(1),
  draftId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { prompt, draftId } = parsed.data;
  // Placeholder image URL; integrate provider later
  const url = `https://placehold.co/1024x768/png?text=${encodeURIComponent(prompt.slice(0, 40))}`;

  const { error } = await supabase
    .from("images")
    .insert({ url, provider: "placeholder", prompt, draft_id: draftId ?? null, created_by: user.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url });
}


