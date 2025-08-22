"use client";

import { useState } from "react";

export function GenerateForm() {
  const [format, setFormat] = useState("blog");
  const [brand, setBrand] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setDraftId(null);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, prompt, brand: brand || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setResult(data.error ? JSON.stringify(data.error) : "Generation failed");
      return;
    }
    setResult(data.content);
    setDraftId(data.draftId ?? null);
  };

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-semibold">AI Generate</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Format</label>
            <select className="w-full border rounded px-3 py-2" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="blog">Blog</option>
              <option value="ad">Ad</option>
              <option value="email">Email</option>
              <option value="script">Script</option>
              <option value="social">Social</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Brand</label>
            <input className="w-full border rounded px-3 py-2" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Prompt</label>
          <textarea className="w-full border rounded px-3 py-2 h-28" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {result && (
        <div className="bg-gray-50 border rounded p-3">
          <div className="text-sm text-gray-600">Result</div>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          {draftId && <div className="text-xs text-gray-500 mt-2">Saved as draft: {draftId}</div>}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
            <input className="border rounded px-3 py-2 md:col-span-4" placeholder="What worked well? (adds to learned tips)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            <select className="border rounded px-3 py-2" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              className="bg-black text-white rounded px-3 py-2"
              onClick={async () => {
                if (!draftId) return;
                await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftId, rating, comment: feedback || undefined }) });
                setFeedback("");
              }}
            >
              Submit feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


