"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ContentGeneratorPage() {
  const supabase = getSupabaseBrowserClient();
  const [contentDrafts, setContentDrafts] = useState<any[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("blog");
  const [generationForm, setGenerationForm] = useState({
    title: "",
    description: "",
    keywords: "",
    targetAudience: "",
    callToAction: ""
  });
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContentDrafts();
  }, []);

  const fetchContentDrafts = async () => {
    const { data } = await supabase
      .from("content_drafts")
      .select("*, projects(name)")
      .order("created_at", { ascending: false })
      .limit(10);
    setContentDrafts(data || []);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const prompt = `Create a ${selectedFormat} about: ${generationForm.title}
Description: ${generationForm.description}
Keywords: ${generationForm.keywords}
Target Audience: ${generationForm.targetAudience}
Call to Action: ${generationForm.callToAction}`;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: selectedFormat,
          prompt: prompt
        })
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

  const saveDraft = async () => {
    if (!generatedContent) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: project } = await supabase
        .from("projects")
        .insert({ 
          name: `${selectedFormat} Project`, 
          description: generationForm.description,
          created_by: user.id 
        })
        .select("id")
        .single();

      if (project) {
        await supabase.from("content_drafts").insert({
          project_id: project.id,
          title: generationForm.title || `${selectedFormat} Draft`,
          content: generatedContent,
          created_by: user.id
        });
        
        await fetchContentDrafts();
        alert("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const formatOptions = [
    { value: "blog", label: "Blog Post", icon: "📝", description: "Long-form articles and blog posts" },
    { value: "social", label: "Social Media", icon: "📱", description: "Posts for social platforms" },
    { value: "ad", label: "Advertisement", icon: "📢", description: "Marketing copy and ads" },
    { value: "email", label: "Email", icon: "📧", description: "Email campaigns and newsletters" },
    { value: "script", label: "Video Script", icon: "🎬", description: "Scripts for videos and podcasts" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Generator Tool</h1>
        <p className="text-gray-600">Multi-format content generation for blogs, social, ads, emails, and scripts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Format Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Content Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedFormat === format.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{format.icon}</span>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Drafts */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contentDrafts.slice(0, 5).map((draft) => (
                  <div key={draft.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{draft.title}</div>
                    <div className="text-gray-600">{draft.projects?.name}</div>
                  </div>
                ))}
                {contentDrafts.length === 0 && (
                  <p className="text-sm text-gray-500">No drafts yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Generation */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate {formatOptions.find(f => f.value === selectedFormat)?.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title/Topic</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter your topic or title"
                      value={generationForm.title}
                      onChange={(e) => setGenerationForm({ ...generationForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Keywords</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="SEO keywords (comma separated)"
                      value={generationForm.keywords}
                      onChange={(e) => setGenerationForm({ ...generationForm, keywords: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 h-20"
                    placeholder="Describe what you want to create..."
                    value={generationForm.description}
                    onChange={(e) => setGenerationForm({ ...generationForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Who is this for?"
                      value={generationForm.targetAudience}
                      onChange={(e) => setGenerationForm({ ...generationForm, targetAudience: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Call to Action</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="What should readers do next?"
                      value={generationForm.callToAction}
                      onChange={(e) => setGenerationForm({ ...generationForm, callToAction: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !generationForm.description}
                  className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Generating..." : `Generate ${formatOptions.find(f => f.value === selectedFormat)?.label}`}
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
                  
                  <div className="flex gap-2">
                    <button
                      onClick={saveDraft}
                      className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => setGeneratedContent("")}
                      className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                    >
                      Clear
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
