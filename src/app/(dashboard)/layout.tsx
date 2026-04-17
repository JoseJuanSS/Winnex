import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="max-w-screen-lg mx-auto flex">
        <Sidebar />

        {/* Main content — padding-bottom for mobile bottom nav */}
        <main className="flex-1 px-4 py-6 pb-24 md:pb-8 min-w-0">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
