import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Link as LinkIcon, Command, FileText, Settings, BarChart, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await auth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-xl tracking-tight">Antonic Admin</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">

          <Link href="/admin/builder" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-zinc-800 transition-colors">
            <LayoutDashboard size={18} /> Site Builder
          </Link>

          <Link href="/admin/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-zinc-800 transition-colors">
            <BarChart size={18} /> Analytics
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-zinc-800 transition-colors">
            <Settings size={18} /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <form action={async () => {
            "use server";
            await signOut();
            redirect("/admin/login");
          }}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-sm">
              <LogOut size={18} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Mobile Header (simplified) */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 md:hidden">
          <span className="font-bold text-lg">Antonic Admin</span>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
