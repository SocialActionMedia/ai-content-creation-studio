"use client";

import { useState } from "react";

export function ImageForm() {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUrl(null);
    const res = await fetch("/api/images/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setUrl(data.url);
  };
  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2">
        <input className="w-full border rounded px-3 py-2" placeholder="Image prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="bg-black text-white rounded px-3 py-2" disabled={loading}>{loading ? "Generating..." : "Generate Image"}</button>
      </form>
      {url && (
        <div className="border rounded p-2">
          <img src={url} alt="Generated" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
}


