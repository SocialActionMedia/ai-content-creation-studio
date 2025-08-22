"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState("brand-voice");
  const [aiAgents, setAiAgents] = useState<any[]>([]);
  const [newAiAgent, setNewAiAgent] = useState({
    name: "",
    description: "",
    type: "content_generator",
    config: {},
    enabled: true
  });

  useEffect(() => {
    fetchUserRole();
    fetchAIAgents();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setUserRole(profile?.role || "");
    }
  };

  const fetchAIAgents = async () => {
    // This would fetch from an ai_agents table if it exists
    // For now, we'll use placeholder data
    setAiAgents([
      {
        id: 1,
        name: "Content Generator",
        description: "AI-powered content creation",
        type: "content_generator",
        enabled: true
      },
      {
        id: 2,
        name: "Image Generator",
        description: "AI visual content creation",
        type: "image_generator",
        enabled: true
      },
      {
        id: 3,
        name: "Compliance Checker",
        description: "Content compliance validation",
        type: "compliance_checker",
        enabled: true
      }
    ]);
  };

  const isAdmin = userRole === "admin";

  const tabs = [
    { id: "brand-voice", label: "Brand Voice", icon: "🎨" },
    { id: "workflows", label: "Workflows", icon: "⚡" },
    { id: "ai-agents", label: "AI Agents", icon: "🤖" },
    { id: "compliance", label: "Compliance", icon: "✅" },
    { id: "optimization", label: "Optimization", icon: "📊" },
    { id: "integrations", label: "Integrations", icon: "🔗" }
  ];

  const renderBrandVoice = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Brand Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Default Brand Profile</h4>
              <p className="text-sm text-gray-600">Tone: Professional, Style: Modern, Guidelines: Clear and concise</p>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              + Add New Brand Profile
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Snippets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded text-sm">"Innovation that transforms"</div>
            <div className="p-2 bg-gray-50 rounded text-sm">"Quality you can trust"</div>
            <button className="w-full p-2 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm">
              + Add Snippet
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Standard Content Workflow</h4>
              <div className="text-sm text-gray-600">
                <div>1. Content Creation → 2. Editor Review → 3. Client Approval</div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">High-Priority Workflow</h4>
              <div className="text-sm text-gray-600">
                <div>1. Content Creation → 2. Admin Review → 3. Immediate Approval</div>
              </div>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              + Create New Workflow
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAIAgents = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAgents.map((agent) => (
              <div key={agent.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{agent.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.enabled ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {agent.enabled ? 'Active' : 'Inactive'}
                    </span>
                    {isAdmin && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Configure</button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                <div className="text-xs text-gray-500">Type: {agent.type}</div>
              </div>
            ))}

            {isAdmin && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium mb-3">Add New AI Agent</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Agent Name</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter agent name"
                      value={newAiAgent.name}
                      onChange={(e) => setNewAiAgent({ ...newAiAgent, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full border rounded px-3 py-2 h-20"
                      placeholder="Describe the agent's purpose"
                      value={newAiAgent.description}
                      onChange={(e) => setNewAiAgent({ ...newAiAgent, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={newAiAgent.type}
                      onChange={(e) => setNewAiAgent({ ...newAiAgent, type: e.target.value })}
                    >
                      <option value="content_generator">Content Generator</option>
                      <option value="image_generator">Image Generator</option>
                      <option value="compliance_checker">Compliance Checker</option>
                      <option value="optimizer">Content Optimizer</option>
                      <option value="analyzer">Performance Analyzer</option>
                    </select>
                  </div>
                  <button className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                    Add AI Agent
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Industry Standards</h4>
              <div className="text-sm text-gray-600">
                <div>• Healthcare: HIPAA compliance</div>
                <div>• Finance: SEC regulations</div>
                <div>• Legal: Bar association rules</div>
              </div>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              + Add Compliance Rule
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Platform Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">LinkedIn Optimization</h4>
              <div className="text-sm text-gray-600">
                <div>• Max length: 1300-2000 characters</div>
                <div>• Include hashtags</div>
                <div>• Professional tone</div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Instagram Optimization</h4>
              <div className="text-sm text-gray-600">
                <div>• Max length: 125 characters</div>
                <div>• Visual-first approach</div>
                <div>• Strategic emoji use</div>
              </div>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              + Add Platform Rules
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>External Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">OpenAI Integration</h4>
              <div className="text-sm text-gray-600">
                <div>Status: Connected</div>
                <div>Model: GPT-4</div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Social Media APIs</h4>
              <div className="text-sm text-gray-600">
                <div>LinkedIn: Not connected</div>
                <div>Twitter: Not connected</div>
                <div>Facebook: Not connected</div>
              </div>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              + Add Integration
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "brand-voice": return renderBrandVoice();
      case "workflows": return renderWorkflows();
      case "ai-agents": return renderAIAgents();
      case "compliance": return renderCompliance();
      case "optimization": return renderOptimization();
      case "integrations": return renderIntegrations();
      default: return renderBrandVoice();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure your content creation studio tools and preferences</p>
        {isAdmin && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">🔧 Admin Mode: You have access to all configuration options</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}


