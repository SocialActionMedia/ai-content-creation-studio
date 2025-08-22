"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CollaborationPage() {
  const supabase = getSupabaseBrowserClient();
  const [contentDrafts, setContentDrafts] = useState<any[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [draftContent, setDraftContent] = useState("");
  const [versions, setVersions] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [newApproval, setNewApproval] = useState({
    comment: "",
    decision: "pending"
  });
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchContentDrafts();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setUserRole(profile?.role || "");
    }
  };

  const fetchContentDrafts = async () => {
    const { data } = await supabase
      .from("content_drafts")
      .select("*, projects(name), profiles(role)")
      .order("created_at", { ascending: false });
    setContentDrafts(data || []);
  };

  const fetchVersions = async (draftId: string) => {
    const { data } = await supabase
      .from("content_versions")
      .select("*")
      .eq("draft_id", draftId)
      .order("created_at", { ascending: false });
    setVersions(data || []);
  };

  const fetchApprovals = async (draftId: string) => {
    const { data } = await supabase
      .from("approvals")
      .select("*, profiles(role)")
      .eq("draft_id", draftId)
      .order("created_at", { ascending: false });
    setApprovals(data || []);
  };

  const handleDraftSelect = async (draft: any) => {
    setSelectedDraft(draft);
    setDraftContent(draft.content);
    await fetchVersions(draft.id);
    await fetchApprovals(draft.id);
  };

  const saveVersion = async () => {
    if (!selectedDraft || !draftContent) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("content_versions").insert({
        draft_id: selectedDraft.id,
        content: draftContent,
        created_by: user.id
      });

      await fetchVersions(selectedDraft.id);
      alert("Version saved successfully!");
    } catch (error) {
      console.error("Version save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const revertToVersion = async (versionId: string) => {
    if (!selectedDraft) return;
    
    try {
      const version = versions.find(v => v.id === versionId);
      if (version) {
        setDraftContent(version.content);
        alert("Reverted to selected version!");
      }
    } catch (error) {
      console.error("Revert failed:", error);
    }
  };

  const submitApproval = async () => {
    if (!selectedDraft || !newApproval.comment) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("approvals").insert({
        draft_id: selectedDraft.id,
        approver_id: user.id,
        decision: newApproval.decision,
        comment: newApproval.comment,
        decided_at: new Date().toISOString()
      });

      setNewApproval({ comment: "", decision: "pending" });
      await fetchApprovals(selectedDraft.id);
      alert("Approval submitted!");
    } catch (error) {
      console.error("Approval submission failed:", error);
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "approved": return "text-green-600 bg-green-50";
      case "rejected": return "text-red-600 bg-red-50";
      case "pending": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const canApprove = (draft: any) => {
    if (userRole === "admin") return true;
    if (userRole === "editor" && draft.profiles?.role === "client") return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Collaboration Tool</h1>
        <p className="text-gray-600">Collaborative editing interface with approval workflows</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drafts Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentDrafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleDraftSelect(draft)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedDraft?.id === draft.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{draft.title}</h4>
                      <span className="text-xs text-gray-500">{draft.projects?.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {draft.content.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-gray-500">
                      Created by: {draft.profiles?.role || "user"}
                    </div>
                  </button>
                ))}
                {contentDrafts.length === 0 && (
                  <p className="text-sm text-gray-500">No content drafts yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDraft ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Editing: {selectedDraft.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <textarea
                        className="w-full border rounded px-3 py-2 h-64"
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        placeholder="Edit your content here..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={saveVersion}
                        disabled={loading}
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? "Saving..." : "Save Version"}
                      </button>
                      <button
                        onClick={() => setDraftContent(selectedDraft.content)}
                        className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                      >
                        Reset Changes
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Versions */}
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">
                            Version {new Date(version.created_at).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {version.content.substring(0, 80)}...
                          </div>
                        </div>
                        <button
                          onClick={() => revertToVersion(version.id)}
                          className="bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700"
                        >
                          Revert
                        </button>
                      </div>
                    ))}
                    {versions.length === 0 && (
                      <p className="text-center py-4 text-gray-500">No versions yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {canApprove(selectedDraft) && (
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-800 mb-3">Submit Approval</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Decision</label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={newApproval.decision}
                              onChange={(e) => setNewApproval({ ...newApproval, decision: e.target.value })}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Comment</label>
                            <textarea
                              className="w-full border rounded px-3 py-2 h-20"
                              placeholder="Add your approval comment..."
                              value={newApproval.comment}
                              onChange={(e) => setNewApproval({ ...newApproval, comment: e.target.value })}
                            />
                          </div>
                          <button
                            onClick={submitApproval}
                            disabled={!newApproval.comment}
                            className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
                          >
                            Submit Approval
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {approvals.map((approval) => (
                        <div key={approval.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              {approval.profiles?.role || "User"}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${getDecisionColor(approval.decision)}`}>
                              {approval.decision}
                            </span>
                          </div>
                          {approval.comment && (
                            <p className="text-sm text-gray-600 mb-2">{approval.comment}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(approval.decided_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {approvals.length === 0 && (
                        <p className="text-center py-4 text-gray-500">No approvals yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Draft</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-lg font-medium">Ready to collaborate?</p>
                  <p className="text-sm">Select a content draft from the left panel to start editing and managing approvals</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collaboration Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Version Control</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Save versions frequently</li>
                    <li>• Use descriptive version names</li>
                    <li>• Review changes before reverting</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Approval Process</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Provide clear feedback</li>
                    <li>• Follow role-based permissions</li>
                    <li>• Document decisions</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Communication</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Use comments effectively</li>
                    <li>• Keep stakeholders informed</li>
                    <li>• Resolve conflicts promptly</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Workflow</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Follow approval chains</li>
                    <li>• Set clear deadlines</li>
                    <li>• Track progress</li>
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
