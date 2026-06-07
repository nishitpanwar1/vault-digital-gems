import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download as DownloadIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDB } from "@/lib/use-store";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — DigitVault Admin" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const data = useDB();
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.profiles
      .filter((p) => !s || p.full_name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s))
      .map((p) => ({
        ...p,
        downloads: data.downloads.filter((d) => d.user_id === p.id).length,
        reviews: data.reviews.filter((r) => r.user_id === p.id).length,
      }));
  }, [data._v, q]);

  function exportCSV() {
    const header = "Name,Email,Joined,Downloads,Reviews,Admin\n";
    const body = rows
      .map((r) => `"${r.full_name}","${r.email}","${r.created_at}",${r.downloads},${r.reviews},${r.is_admin}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{rows.length} total · realtime updates</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <DownloadIcon size={14} className="mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email..." className="pl-9" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Reviews</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No users yet.</td></tr>
            )}
            {rows.map((u) => (
              <>
                <tr key={u.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full bg-muted" />
                      <span className="font-medium">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{format(new Date(u.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 tabular-nums">{u.downloads}</td>
                  <td className="px-4 py-3 tabular-nums">{u.reviews}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">User</span>
                    )}
                  </td>
                </tr>
                {expanded === u.id && (
                  <tr className="bg-muted/20">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Downloads</h4>
                          <ul className="space-y-1 text-xs">
                            {data.downloads.filter((d) => d.user_id === u.id).slice(0, 5).map((d) => {
                              const p = data.products.find((x) => x.id === d.product_id);
                              return <li key={d.id}>· {p?.title ?? "Unknown"} <span className="text-muted-foreground">— {format(new Date(d.downloaded_at), "MMM d")}</span></li>;
                            })}
                            {data.downloads.filter((d) => d.user_id === u.id).length === 0 && <li className="text-muted-foreground">No downloads.</li>}
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Reviews</h4>
                          <ul className="space-y-1 text-xs">
                            {data.reviews.filter((r) => r.user_id === u.id).slice(0, 5).map((r) => {
                              const p = data.products.find((x) => x.id === r.product_id);
                              return <li key={r.id}>· {p?.title ?? "Unknown"} ({r.rating}★)</li>;
                            })}
                            {data.reviews.filter((r) => r.user_id === u.id).length === 0 && <li className="text-muted-foreground">No reviews.</li>}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
