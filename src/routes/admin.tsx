import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { BarChart3, Users, Package, Download, MessageSquare, Home as HomeIcon } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useCurrentUser, useDB } from "@/lib/use-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — DigitVault" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/downloads", label: "Downloads", icon: Download },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
];

function AdminLayout() {
  const user = useCurrentUser();
  const { session_user_id } = useDB();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Only act once we know the session state
    if (!session_user_id) {
      nav({ to: "/auth/login" });
    } else if (user && !user.is_admin) {
      nav({ to: "/" });
    }
  }, [user, session_user_id, nav]);

  // Waiting for profile/role hydration
  if (session_user_id && !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading admin…</div>;
  }
  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-sidebar lg:block">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <span className="text-sm font-bold text-primary-foreground">DV</span>
          </div>
          <div>
            <div className="text-sm font-semibold">DigitVault</div>
            <div className="text-[10px] uppercase tracking-wider text-primary">Admin</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon size={16} /> {item.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t mt-4">
            <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent">
              <HomeIcon size={16} /> Back to site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 overflow-x-auto border-b bg-sidebar px-4 lg:hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <span className="text-xs font-bold text-primary-foreground">DV</span>
        </div>
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${active ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {item.label}
            </Link>
          );
        })}
      </header>

      <main className="lg:pl-60">
        <Toaster position="top-right" />
        <Outlet />
      </main>
    </div>
  );
}
