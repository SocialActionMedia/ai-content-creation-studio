"use client";

import { useState } from "react";

export function ComplianceForm() {
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/compliance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, industry: industry || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    setResult(res.ok ? data : { error: data.error });
  };

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-semibold">Compliance Check</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <textarea className="w-full border rounded px-3 py-2 h-28" value={content} onChange={(e) => setContent(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Industry (optional, e.g., healthcare)" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        <button type="submit" disabled={loading} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {result && (
        <div className="bg-gray-50 border rounded p-3 text-sm">
          {result.error ? (
            <pre>{JSON.stringify(result.error)}</pre>
          ) : result.violations?.length ? (
            <div>
              <ul className="list-disc pl-5">
                {result.violations.map((v: any) => (
                  <li key={v.id}>
                    <span className="font-medium">[{v.severity}]</span> {v.description} {v.blocking ? "(blocking)" : ""}
                  </li>
                ))}
              </ul>
              {result.hasBlocking && <div className="text-red-600 mt-2">Blocking issues present. Admin override required to approve.</div>}
            </div>
          ) : (
            <div>No violations.</div>
          )}
        </div>
      )}
    </div>
  );
}


