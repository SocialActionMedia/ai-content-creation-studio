"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AIWritingPage() {
  const supabase = getSupabaseBrowserClient();
  const [brandProfiles, setBrandProfiles] = useState<any[]>([]);
  const [brandSnippets, setBrandSnippets] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [generationForm, setGenerationForm] = useState({
    format: "blog",
    prompt: "",
    brand: "",
    tone: "",
    style: ""
  });
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    fetchBrandProfiles();
    fetchBrandSnippets();
  }, []);

  const fetchBrandProfiles = async () => {
    const { data } = await supabase.from("brand_profiles").select("*").order("created_at", { ascending: false });
    setBrandProfiles(data || []);
  };

  const fetchBrandSnippets = async () => {
    const { data } = await supabase.from("brand_snippets").select("*").order("created_at", { ascending: false });
    setBrandSnippets(data || []);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generationForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        setGeneratedContent(data.content);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedback.rating || !feedback.comment) return;
    
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedContent,
          rating: feedback.rating,
          comment: feedback.comment,
          format: generationForm.format
        })
      });
      
      setFeedback({ rating: 0, comment: "" });
      alert("Feedback submitted! This will help improve future generations.");
    } catch (error) {
      console.error("Feedback submission failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Writing Tool</h1>
        <p className="text-gray-600">AI-powered content generation trained on your brand voice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Voice Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {brandProfiles.map((profile) => (
                  <div key={profile.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{profile.name}</h4>
                    <p className="text-sm text-gray-600">Tone: {profile.tone}</p>
                    <p className="text-sm text-gray-600">Style: {profile.style_guidelines}</p>
                  </div>
                ))}
                {brandProfiles.length === 0 && (
                  <p className="text-sm text-gray-500">No brand profiles yet. Create one in Settings.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Snippets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {brandSnippets.slice(0, 5).map((snippet) => (
                  <div key={snippet.id} className="p-2 bg-gray-50 rounded text-sm">
                    "{snippet.text}"
                  </div>
                ))}
                {brandSnippets.length === 0 && (
                  <p className="text-sm text-gray-500">No brand snippets yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Generation Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Content</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Format</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={generationForm.format}
                      onChange={(e) => setGenerationForm({ ...generationForm, format: e.target.value })}
                    >
                      <option value="blog">Blog Post</option>
                      <option value="ad">Advertisement</option>
                      <option value="email">Email</option>
                      <option value="script">Video Script</option>
                      <option value="social">Social Media</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Profile</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={selectedProfile}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                    >
                      <option value="">Select Brand Profile</option>
                      {brandProfiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Content Prompt</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 h-24"
                    placeholder="Describe what you want to create..."
                    value={generationForm.prompt}
                    onChange={(e) => setGenerationForm({ ...generationForm, prompt: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !generationForm.prompt}
                  className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Content"}
                </button>
              </form>
            </CardContent>
          </Card>

          {generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Rate this content:</h4>
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                          className={`text-2xl ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full border rounded px-3 py-2 h-20"
                      placeholder="Add feedback to help improve future generations..."
                      value={feedback.comment}
                      onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    />
                    <button
                      onClick={handleFeedback}
                      disabled={!feedback.rating || !feedback.comment}
                      className="mt-2 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
