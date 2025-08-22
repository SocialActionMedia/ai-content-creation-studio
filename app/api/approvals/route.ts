import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";

const schema = z.object({
  draftId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().optional(),
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

  const { draftId, decision, comment } = parsed.data;

  // enforce blocking compliance unless admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (decision === "approved" && !isAdmin(profile?.role as "admin" | "editor" | "client" | undefined)) {
    const { data: latestAudit } = await supabase
      .from("compliance_audits")
      .select("violations")
      .eq("draft_id", draftId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    type Violation = { blocking?: boolean };
    const hasBlocking = Array.isArray(latestAudit?.violations) && (latestAudit!.violations as Violation[]).some((v) => v.blocking);
    if (hasBlocking) return NextResponse.json({ error: "Blocking compliance issues present. Admin override required." }, { status: 403 });
  }
  const { error } = await supabase.from("approvals").insert({
    draft_id: draftId,
    approver_id: user.id,
    decision,
    comment,
    decided_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


