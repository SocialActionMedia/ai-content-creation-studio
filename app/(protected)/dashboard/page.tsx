"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const [userRole, setUserRole] = useState<string>("");
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDrafts: 0,
    pendingApprovals: 0,
    recentContent: 0
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setUserRole(profile?.role || "");
      }
    };
    fetchUserRole();
  }, [supabase]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch basic stats
        const [projects, drafts, approvals, content] = await Promise.all([
          supabase.from("projects").select("id", { count: "exact" }),
          supabase.from("content_drafts").select("id", { count: "exact" }),
          supabase.from("approvals").select("id", { count: "exact" }).eq("decision", "pending"),
          supabase.from("content_drafts").select("id", { count: "exact" }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]);
        
        setStats({
          totalProjects: projects.count || 0,
          totalDrafts: drafts.count || 0,
          pendingApprovals: approvals.count || 0,
          recentContent: content.count || 0
        });
      }
    };
    fetchStats();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Creation Studio</h1>
          <p className="text-gray-600">Welcome to your AI-powered content creation hub</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Role: {userRole}</p>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalDrafts}</div>
            <div className="text-sm text-gray-600">Content Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <div className="text-sm text-gray-600">Pending Approvals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.recentContent}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">✍️</div>
                <div className="font-medium">Generate Content</div>
                <div className="text-sm text-gray-500">AI-powered writing</div>
              </div>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-medium">Create Images</div>
                <div className="text-sm text-gray-500">AI visual content</div>
              </div>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-gray-500">Performance insights</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New content draft created</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Content approved</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">A/B test started</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">AI Writing Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Compliance System</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Optimization Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Collaboration Platform</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


