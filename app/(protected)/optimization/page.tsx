"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function OptimizationPage() {
  const supabase = getSupabaseBrowserClient();
  const [optimizationConfigs, setOptimizationConfigs] = useState<any[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [contentToOptimize, setContentToOptimize] = useState("");
  const [optimizedContent, setOptimizedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [newConfig, setNewConfig] = useState({
    platform: "",
    format: "",
    name: "",
    description: "",
    rules: {}
  });

  useEffect(() => {
    fetchOptimizationConfigs();
  }, []);

  const fetchOptimizationConfigs = async () => {
    const { data } = await supabase.from("optimization_configs").select("*").order("created_at", { ascending: false });
    setOptimizationConfigs(data || []);
  };

  const handleOptimize = async () => {
    if (!contentToOptimize || !selectedConfig) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/optimize/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToOptimize,
          platform: selectedConfig.platform,
          format: selectedConfig.format
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setOptimizedContent(data.optimized);
      }
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveNewConfig = async () => {
    if (!newConfig.platform || !newConfig.format || !newConfig.name) return;
    
    try {
      await supabase.from("optimization_configs").insert({
        platform: newConfig.platform,
        format: newConfig.format,
        name: newConfig.name,
        description: newConfig.description,
        rules: newConfig.rules
      });
      
      setNewConfig({ platform: "", format: "", name: "", description: "", rules: {} });
      await fetchOptimizationConfigs();
      alert("Optimization config saved!");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const platforms = [
    { value: "linkedin", label: "LinkedIn", icon: "💼" },
    { value: "instagram", label: "Instagram", icon: "📸" },
    { value: "facebook", label: "Facebook", icon: "📘" },
    { value: "twitter", label: "Twitter", icon: "🐦" },
    { value: "email", label: "Email", icon: "📧" },
    { value: "ads", label: "Advertising", icon: "📢" }
  ];

  const formats = [
    { value: "post", label: "Social Post" },
    { value: "article", label: "Article" },
    { value: "ad", label: "Advertisement" },
    { value: "email", label: "Email" },
    { value: "caption", label: "Caption" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Optimization Tool</h1>
        <p className="text-gray-600">Platform-specific optimization algorithms for maximum engagement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Configs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimizationConfigs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => setSelectedConfig(config)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedConfig?.id === config.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-gray-600">
                      {config.platform} • {config.format}
                    </div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </button>
                ))}
                {optimizationConfigs.length === 0 && (
                  <p className="text-sm text-gray-500">No optimization configs yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Config</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={newConfig.platform}
                    onChange={(e) => setNewConfig({ ...newConfig, platform: e.target.value })}
                  >
                    <option value="">Select Platform</option>
                    {platforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Format</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={newConfig.format}
                    onChange={(e) => setNewConfig({ ...newConfig, format: e.target.value })}
                  >
                    <option value="">Select Format</option>
                    {formats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Config name"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm h-16"
                    placeholder="Describe this optimization config"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  />
                </div>

                <button
                  onClick={saveNewConfig}
                  disabled={!newConfig.platform || !newConfig.format || !newConfig.name}
                  className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Config
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedConfig ? `Optimize for ${selectedConfig.platform} ${selectedConfig.format}` : "Select a configuration"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConfig ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content to Optimize</label>
                    <textarea
                      className="w-full border rounded px-3 py-2 h-32"
                      placeholder="Paste your content here..."
                      value={contentToOptimize}
                      onChange={(e) => setContentToOptimize(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleOptimize}
                    disabled={loading || !contentToOptimize}
                    className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Optimizing..." : "Optimize Content"}
                  </button>

                  {selectedConfig.description && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Optimization Rules</h4>
                      <p className="text-sm text-blue-700">{selectedConfig.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⚙️</div>
                  <p>Select an optimization configuration to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {optimizedContent && (
            <Card>
              <CardHeader>
                <CardTitle>Optimized Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{optimizedContent}</pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentToOptimize(optimizedContent)}
                      className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                    >
                      Use Optimized Content
                    </button>
                    <button
                      onClick={() => setOptimizedContent("")}
                      className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">LinkedIn</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Professional tone</li>
                    <li>• 1300-2000 characters</li>
                    <li>• Include hashtags</li>
                  </ul>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <h4 className="font-medium text-pink-800 mb-2">Instagram</h4>
                  <ul className="text-sm text-pink-700 space-y-1">
                    <li>• Visual-first approach</li>
                    <li>• 125 characters max</li>
                    <li>• Use emojis strategically</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Twitter</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Concise messaging</li>
                    <li>• 280 characters</li>
                    <li>• Thread for longer content</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Email</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Clear subject lines</li>
                    <li>• Personalization</li>
                    <li>• Mobile-friendly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
