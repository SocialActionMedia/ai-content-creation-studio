"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const [userRole, setUserRole] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setUserRole(profile?.role || "");
      }
    };
    fetchUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠", description: "Main hub for all tools" },
    { name: "AI Writing Tool", href: "/ai-writing", icon: "✍️", description: "AI-powered content generation" },
    { name: "Content Generator", href: "/content-generator", icon: "📝", description: "Multi-format content creation" },
    { name: "Optimization Tool", href: "/optimization", icon: "⚡", description: "Platform-specific optimization" },
    { name: "Compliance Tool", href: "/compliance", icon: "✅", description: "Industry compliance checking" },
    { name: "A/B Testing Tool", href: "/ab-testing", icon: "🧪", description: "Content variation testing" },
    { name: "Visual Content AI", href: "/visual-content", icon: "🎨", description: "AI image generation" },
    { name: "Collaboration Tool", href: "/collaboration", icon: "👥", description: "Team editing & approvals" },
    { name: "Performance Learning", href: "/performance", icon: "📊", description: "Quality improvement system" },
    { name: "Settings", href: "/settings", icon: "⚙️", description: "System configuration" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Content Creation Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{userEmail}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {userRole}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


