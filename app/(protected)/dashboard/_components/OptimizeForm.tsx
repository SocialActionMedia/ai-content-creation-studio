"use client";

import { useState } from "react";

export function OptimizeForm() {
  const [draftId, setDraftId] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [format, setFormat] = useState("blog");
  const [optimized, setOptimized] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOptimized(null);
    const res = await fetch("/api/optimize/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId, platform, format }),
    });
    const data = await res.json();
    setLoading(false);
    setOptimized(res.ok ? data.optimized : JSON.stringify(data.error));
  };
  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-semibold">Optimize</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Draft ID</label>
            <input className="w-full border rounded px-3 py-2" value={draftId} onChange={(e) => setDraftId(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Platform</label>
            <input className="w-full border rounded px-3 py-2" value={platform} onChange={(e) => setPlatform(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Format</label>
            <input className="w-full border rounded px-3 py-2" value={format} onChange={(e) => setFormat(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">
          {loading ? "Optimizing..." : "Apply Optimization"}
        </button>
      </form>
      {optimized && (
        <div className="bg-gray-50 border rounded p-3">
          <div className="text-sm text-gray-600">Optimized</div>
          <pre className="whitespace-pre-wrap text-sm">{optimized}</pre>
        </div>
      )}
    </div>
  );
}


