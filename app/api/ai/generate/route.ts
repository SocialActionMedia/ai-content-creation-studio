import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/ai/prompts";

const schema = z.object({
  format: z.enum(["blog", "ad", "email", "script", "social"]),
  prompt: z.string().min(1),
  brand: z.string().optional(),
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

  const { format, prompt, brand } = parsed.data;

  // Load recent brand docs as context
  const { data: docs } = await supabase
    .from("brand_documents")
    .select("title, url")
    .order("created_at", { ascending: false })
    .limit(3);
  const brandVoice = docs?.map((d) => `${d.title}: ${d.url}`).join("\n") ?? null;

  // Load one brand profile
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("name, tone, style_guidelines")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Load learned tips
  const { data: tips } = await supabase
    .from("learned_tips")
    .select("text, weight")
    .order("updated_at", { ascending: false })
    .limit(5);
  const learnedTips = tips?.map((t) => `- ${t.text} (weight ${t.weight})`).join("\n") ?? null;

  let content = `Generated ${format} for ${brand ?? "generic brand"}: ${prompt}`;
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const promptText = buildPrompt(format, prompt, brandVoice, profile ?? undefined, learnedTips ?? undefined);
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful content generation assistant." },
            { role: "user", content: promptText },
          ],
          temperature: 0.7,
        }),
      });
      const json = await resp.json();
      content = json.choices?.[0]?.message?.content ?? content;
    } catch {
      // fall back to placeholder content
    }
  }

  const { data: project } = await supabase
    .from("projects")
    .insert({ name: `${brand ?? "General"} Project`, description: "Auto-created", created_by: user.id })
    .select("id")
    .single();

  const { data: draft, error: draftError } = await supabase
    .from("content_drafts")
    .insert({ project_id: project?.id, title: `${format} draft`, content, created_by: user.id })
    .select("id, title")
    .single();

  if (draftError) {
    return NextResponse.json({ error: draftError.message }, { status: 500 });
  }

  return NextResponse.json({ content, draftId: draft?.id });
}


