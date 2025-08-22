"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PerformancePage() {
  const supabase = getSupabaseBrowserClient();
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [learnedTips, setLearnedTips] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [newFeedback, setNewFeedback] = useState({
    content: "",
    rating: 5,
    comment: "",
    format: "blog"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPerformanceMetrics();
    fetchFeedbackData();
    fetchLearnedTips();
  }, []);

  const fetchPerformanceMetrics = async () => {
    const { data } = await supabase
      .from("performance_metrics")
      .select("*, content_drafts(title)")
      .order("created_at", { ascending: false })
      .limit(20);
    setPerformanceMetrics(data || []);
  };

  const fetchFeedbackData = async () => {
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setFeedbackData(data || []);
  };

  const fetchLearnedTips = async () => {
    const { data } = await supabase
      .from("learned_tips")
      .select("*")
      .order("weight", { ascending: false })
      .limit(10);
    setLearnedTips(data || []);
  };

  const submitFeedback = async () => {
    if (!newFeedback.content || !newFeedback.comment) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("feedback").insert({
        content: newFeedback.content,
        rating: newFeedback.rating,
        comment: newFeedback.comment,
        format: newFeedback.format,
        user_id: user.id
      });

      setNewFeedback({ content: "", rating: 5, comment: "", format: "blog" });
      await fetchFeedbackData();
      await fetchLearnedTips(); // Refresh tips as they may have been updated
      alert("Feedback submitted! This helps improve future content generation.");
    } catch (error) {
      console.error("Feedback submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPerformanceTrend = (metrics: any[]) => {
    if (metrics.length < 2) return "insufficient data";
    
    const recent = metrics.slice(0, 5).reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / 5;
    const older = metrics.slice(5, 10).reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / 5;
    
    if (recent > older * 1.1) return "improving";
    if (recent < older * 0.9) return "declining";
    return "stable";
  };

  const formats = [
    { value: "blog", label: "Blog Post", icon: "📝" },
    { value: "ad", label: "Advertisement", icon: "📢" },
    { value: "email", label: "Email", icon: "📧" },
    { value: "script", label: "Video Script", icon: "🎬" },
    { value: "social", label: "Social Media", icon: "📱" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Learning System</h1>
        <p className="text-gray-600">Monitor performance metrics and improve output quality through feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceMetrics.length}
                  </div>
                  <div className="text-sm text-blue-600">Content Pieces Tracked</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {feedbackData.length}
                  </div>
                  <div className="text-sm text-green-600">Feedback Submissions</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {learnedTips.length}
                  </div>
                  <div className="text-sm text-purple-600">Learned Tips</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {getPerformanceTrend(performanceMetrics)}
                  </div>
                  <div className="text-sm text-orange-600">Performance Trend</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Content Format</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={newFeedback.format}
                    onChange={(e) => setNewFeedback({ ...newFeedback, format: e.target.value })}
                  >
                    {formats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.icon} {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                        className={`text-2xl ${newFeedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content Sample</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm h-16"
                    placeholder="Paste a sample of the content..."
                    value={newFeedback.content}
                    onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Feedback Comment</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm h-20"
                    placeholder="What worked well? What could be improved?"
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                    required
                  />
                </div>

                <button
                  onClick={submitFeedback}
                  disabled={loading || !newFeedback.comment}
                  className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceMetrics.map((metric) => (
                  <div key={metric.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{metric.content_drafts?.title || "Untitled"}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(metric.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Engagement:</span>
                        <span className="ml-1">{metric.engagement_rate || 0}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Clicks:</span>
                        <span className="ml-1">{metric.click_through_rate || 0}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Conversions:</span>
                        <span className="ml-1">{metric.conversion_rate || 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {performanceMetrics.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No performance metrics yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedbackData.map((feedback) => (
                  <div key={feedback.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getRatingColor(feedback.rating)}`}>
                          {feedback.rating}/5
                        </span>
                        <span className="text-sm font-medium">
                          {formats.find(f => f.value === feedback.format)?.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.content && (
                      <p className="text-sm text-gray-600 mb-2">
                        "{feedback.content.substring(0, 100)}..."
                      </p>
                    )}
                    <p className="text-sm">{feedback.comment}</p>
                  </div>
                ))}
                {feedbackData.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No feedback submitted yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learned Tips */}
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learnedTips.map((tip) => (
                    <div key={tip.id} className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-yellow-800">Tip #{tip.id}</h4>
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          Weight: {tip.weight}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">{tip.text}</p>
                      <div className="text-xs text-yellow-600 mt-2">
                        Updated: {new Date(tip.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                {learnedTips.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No learned tips yet. Submit feedback to help the AI learn!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Content Quality</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Monitor engagement rates</li>
                    <li>• Track conversion metrics</li>
                    <li>• Analyze user feedback</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">AI Learning</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Submit detailed feedback</li>
                    <li>• Rate content quality</li>
                    <li>• Provide specific comments</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Continuous Improvement</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Review performance trends</li>
                    <li>• Apply learned insights</li>
                    <li>• Iterate on strategies</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Best Practices</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Regular feedback submission</li>
                    <li>• Honest quality ratings</li>
                    <li>• Constructive comments</li>
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
