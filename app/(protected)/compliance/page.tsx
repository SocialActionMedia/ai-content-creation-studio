"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CompliancePage() {
  const supabase = getSupabaseBrowserClient();
  const [complianceRules, setComplianceRules] = useState<any[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [contentToCheck, setContentToCheck] = useState("");
  const [checkResults, setCheckResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    pattern: "",
    industry: "",
    category: "",
    severity: "medium",
    blocking: false,
    enabled: true
  });

  useEffect(() => {
    fetchComplianceRules();
  }, []);

  const fetchComplianceRules = async () => {
    const { data } = await supabase.from("compliance_rules").select("*").order("created_at", { ascending: false });
    setComplianceRules(data || []);
  };

  const handleComplianceCheck = async () => {
    if (!contentToCheck) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/compliance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToCheck,
          industry: selectedIndustry || undefined
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setCheckResults(data);
      }
    } catch (error) {
      console.error("Compliance check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveNewRule = async () => {
    if (!newRule.name || !newRule.pattern) return;
    
    try {
      await supabase.from("compliance_rules").insert({
        name: newRule.name,
        description: newRule.description,
        pattern: newRule.pattern,
        industry: newRule.industry || null,
        category: newRule.category || null,
        severity: newRule.severity,
        blocking: newRule.blocking,
        enabled: newRule.enabled
      });
      
      setNewRule({
        name: "", description: "", pattern: "", industry: "", category: "",
        severity: "medium", blocking: false, enabled: true
      });
      await fetchComplianceRules();
      alert("Compliance rule saved!");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const industries = [
    "Healthcare", "Finance", "Legal", "Education", "Technology", 
    "Marketing", "Real Estate", "Food & Beverage", "Travel", "Retail"
  ];

  const categories = [
    "Privacy", "Security", "Legal", "Brand", "Accessibility", 
    "Regulatory", "Ethical", "Quality", "Tone", "Format"
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getBlockingStatus = (blocking: boolean) => {
    return blocking ? (
      <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">Blocking</span>
    ) : (
      <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Non-blocking</span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Checking Tool</h1>
        <p className="text-gray-600">Industry-specific compliance checking system for regulated content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceRules.map((rule) => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                        {getBlockingStatus(rule.blocking)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="text-xs text-gray-500">
                      {rule.industry && <span className="mr-2">Industry: {rule.industry}</span>}
                      {rule.category && <span>Category: {rule.category}</span>}
                    </div>
                  </div>
                ))}
                {complianceRules.length === 0 && (
                  <p className="text-sm text-gray-500">No compliance rules yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Rule Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Rule name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm h-16"
                    placeholder="Describe this rule"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pattern (Regex)</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Regular expression pattern"
                    value={newRule.pattern}
                    onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={newRule.industry}
                      onChange={(e) => setNewRule({ ...newRule, industry: e.target.value })}
                    >
                      <option value="">Any Industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={newRule.category}
                      onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                    >
                      <option value="">Any Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={newRule.severity}
                      onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newRule.blocking}
                        onChange={(e) => setNewRule({ ...newRule, blocking: e.target.checked })}
                      />
                      Blocking
                    </label>
                  </div>
                </div>

                <button
                  onClick={saveNewRule}
                  disabled={!newRule.name || !newRule.pattern}
                  className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Rule
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Check Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Compliance Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry (Optional)</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                    >
                      <option value="">All Industries</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleComplianceCheck}
                      disabled={loading || !contentToCheck}
                      className="w-full bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? "Checking..." : "Check Compliance"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content to Check</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 h-32"
                    placeholder="Paste your content here for compliance checking..."
                    value={contentToCheck}
                    onChange={(e) => setContentToCheck(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {checkResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Compliance Results
                  {checkResults.hasBlocking && (
                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-sm">⚠️ Blocking Issues Found</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkResults.violations.length > 0 ? (
                    <div className="space-y-3">
                      {checkResults.violations.map((violation: any, index: number) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          violation.blocking ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{violation.description}</h4>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(violation.severity)}`}>
                                {violation.severity}
                              </span>
                              {violation.blocking && (
                                <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">Blocking</span>
                              )}
                            </div>
                          </div>
                          {violation.category && (
                            <p className="text-sm text-gray-600">Category: {violation.category}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-green-600">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="font-medium">No compliance violations found!</p>
                      <p className="text-sm text-gray-600">Your content meets all compliance requirements.</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">Total Violations:</span> {checkResults.violations.length}
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">Blocking Issues:</span> {checkResults.hasBlocking ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Industry Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Compliance Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Healthcare</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• HIPAA compliance</li>
                    <li>• Medical claims verification</li>
                    <li>• Patient privacy protection</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Finance</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• SEC regulations</li>
                    <li>• Financial advice disclaimers</li>
                    <li>• Investment risk warnings</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Legal</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Attorney-client privilege</li>
                    <li>• Legal disclaimers</li>
                    <li>• Bar association rules</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Marketing</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• FTC guidelines</li>
                    <li>• Truth in advertising</li>
                    <li>• Endorsement disclosures</li>
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
