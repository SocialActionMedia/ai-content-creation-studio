"use client";

import { useState } from "react";

export function FastForm() {
  const [format, setFormat] = useState("social");
  const [platform, setPlatform] = useState("LinkedIn");
  const [brand, setBrand] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/fast/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, platform, brand: brand || undefined, prompt }),
    });
    const data = await res.json();
    setLoading(false);
    setResult(res.ok ? data : { error: data.error });
  };

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select className="border rounded px-3 py-2" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="blog">Blog</option>
          <option value="ad">Ad</option>
          <option value="email">Email</option>
          <option value="script">Script</option>
          <option value="social">Social</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder="Platform (e.g., LinkedIn)" value={platform} onChange={(e) => setPlatform(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Brand (optional)" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <button type="submit" className="bg-black text-white rounded px-3 py-2" disabled={loading}>
          {loading ? "Generating..." : "Fast Generate"}
        </button>
      </form>
      <textarea className="w-full border rounded p-2 h-28" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt" />
      {result && (
        <div className="bg-gray-50 border rounded p-3 text-sm">
          {result.error ? <pre>{JSON.stringify(result.error)}</pre> : (
            <>
              <div className="font-semibold mb-1">Result</div>
              <pre className="whitespace-pre-wrap">{result.content}</pre>
              {result.violations?.length ? (
                <div className="mt-2">
                  <div className="font-semibold">Compliance Flags</div>
                  <ul className="list-disc pl-5">
                    {result.violations.map((v: any) => <li key={v.id}>{v.description}</li>)}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}


