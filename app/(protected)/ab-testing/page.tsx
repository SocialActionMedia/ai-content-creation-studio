"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ABTestingPage() {
  const supabase = getSupabaseBrowserClient();
  const [abTests, setAbTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    contentA: "",
    contentB: "",
    metric: "engagement",
    duration: 7
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchABTests();
  }, []);

  const fetchABTests = async () => {
    const { data } = await supabase.from("ab_tests").select("*").order("created_at", { ascending: false });
    setAbTests(data || []);
  };

  const fetchTestResults = async (testId: string) => {
    const { data } = await supabase
      .from("ab_test_results")
      .select("*")
      .eq("test_id", testId)
      .order("created_at", { ascending: false });
    setTestResults(data || []);
  };

  const createNewTest = async () => {
    if (!newTest.name || !newTest.contentA || !newTest.contentB) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: test } = await supabase.from("ab_tests").insert({
        name: newTest.name,
        description: newTest.description,
        content_a: newTest.contentA,
        content_b: newTest.contentB,
        metric: newTest.metric,
        duration_days: newTest.duration,
        status: "active",
        created_by: user.id
      }).select("*").single();

      if (test) {
        setNewTest({ name: "", description: "", contentA: "", contentB: "", metric: "engagement", duration: 7 });
        await fetchABTests();
        alert("A/B test created successfully!");
      }
    } catch (error) {
      console.error("Test creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const recordResult = async (testId: string, variant: "A" | "B", value: number) => {
    try {
      await supabase.from("ab_test_results").insert({
        test_id: testId,
        variant,
        metric_value: value,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      await fetchTestResults(testId);
      alert("Result recorded!");
    } catch (error) {
      console.error("Result recording failed:", error);
    }
  };

  const getTestStatus = (test: any) => {
    const created = new Date(test.created_at);
    const endDate = new Date(created.getTime() + test.duration_days * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > endDate) return "completed";
    if (test.status === "paused") return "paused";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50";
      case "completed": return "text-blue-600 bg-blue-50";
      case "paused": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const calculateResults = (results: any[], variant: "A" | "B") => {
    const variantResults = results.filter(r => r.variant === variant);
    if (variantResults.length === 0) return { count: 0, avg: 0 };
    
    const total = variantResults.reduce((sum, r) => sum + r.metric_value, 0);
    return {
      count: variantResults.length,
      avg: total / variantResults.length
    };
  };

  const metrics = [
    { value: "engagement", label: "Engagement Rate", icon: "👥" },
    { value: "clicks", label: "Click-through Rate", icon: "🖱️" },
    { value: "conversions", label: "Conversion Rate", icon: "💰" },
    { value: "time_spent", label: "Time on Page", icon: "⏱️" },
    { value: "shares", label: "Share Rate", icon: "📤" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">A/B Testing Tool</h1>
        <p className="text-gray-600">Generate and test content variations for maximum performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {abTests.map((test) => {
                  const status = getTestStatus(test);
                  return (
                    <button
                      key={test.id}
                      onClick={() => {
                        setSelectedTest(test);
                        fetchTestResults(test.id);
                      }}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        selectedTest?.id === test.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                      <div className="text-xs text-gray-500">
                        Metric: {metrics.find(m => m.value === test.metric)?.label}
                      </div>
                    </button>
                  );
                })}
                {abTests.length === 0 && (
                  <p className="text-sm text-gray-500">No A/B tests yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create New Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Test Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Test name"
                    value={newTest.name}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm h-16"
                    placeholder="Describe what you're testing"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Metric</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={newTest.metric}
                    onChange={(e) => setNewTest({ ...newTest, metric: e.target.value })}
                  >
                    {metrics.map((metric) => (
                      <option key={metric.value} value={metric.value}>
                        {metric.icon} {metric.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days)</label>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-sm"
                    min="1"
                    max="30"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                  />
                </div>

                <button
                  onClick={createNewTest}
                  disabled={loading || !newTest.name || !newTest.contentA || !newTest.contentB}
                  className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Test"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Content Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTest ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Test: {selectedTest.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Variant A</h4>
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <pre className="whitespace-pre-wrap text-sm">{selectedTest.content_a}</pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Variant B</h4>
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <pre className="whitespace-pre-wrap text-sm">{selectedTest.content_b}</pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Record Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Variant A Results</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Count:</span> {calculateResults(testResults, "A").count}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Average:</span> {calculateResults(testResults, "A").avg.toFixed(2)}
                        </div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Enter metric value"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const value = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(value)) {
                                recordResult(selectedTest.id, "A", value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Variant B Results</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Count:</span> {calculateResults(testResults, "B").count}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Average:</span> {calculateResults(testResults, "B").avg.toFixed(2)}
                        </div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Enter metric value"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const value = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(value)) {
                                recordResult(selectedTest.id, "B", value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">Variant {result.variant}:</span>
                          <span className="ml-2">{result.metric_value}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(result.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {testResults.length === 0 && (
                      <p className="text-center py-4 text-gray-500">No results recorded yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🧪</div>
                  <p>Select an A/B test from the left panel to view details and record results</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* A/B Testing Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Test Design</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Test one variable at a time</li>
                    <li>• Ensure statistical significance</li>
                    <li>• Run tests for adequate duration</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Analysis</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Monitor results regularly</li>
                    <li>• Consider external factors</li>
                    <li>• Document learnings</li>
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
