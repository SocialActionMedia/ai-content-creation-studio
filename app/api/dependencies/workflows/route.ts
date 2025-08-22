import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(1),
  steps: z.array(z.object({ order: z.number().int().min(1), role: z.enum(["admin","editor","client"]) })).min(1),
});

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, steps } = parsed.data;
  const { data: wf, error: wfErr } = await supabase.from("workflow_definitions").insert({ name, created_by: user.id }).select("id").single();
  if (wfErr) return NextResponse.json({ error: wfErr.message }, { status: 500 });
  const { error: stepsErr } = await supabase.from("workflow_steps").insert(steps.map((s) => ({ workflow_id: wf!.id, step_order: s.order, required_role: s.role })));
  if (stepsErr) return NextResponse.json({ error: stepsErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, workflowId: wf!.id });
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: defs } = await supabase.from("workflow_definitions").select("id, name, created_at");
  return NextResponse.json({ data: defs ?? [] });
}


