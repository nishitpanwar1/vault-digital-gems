import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useDB } from "@/lib/use-store";

export const Route = createFileRoute("/admin/downloads")({
  head: () => ({ meta: [{ title: "Downloads — DigitVault Admin" }] }),
  component: AdminDownloads,
});

function AdminDownloads() {
  const data = useDB();
  const [productFilter, setProductFilter] = useState("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let list = [...data.downloads].sort((a, b) => new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime());
    if (productFilter !== "all") list = list.filter((d) => d.product_id === productFilter);
    return list.map((d) => ({
      ...d,
      user: data.profiles.find((p) => p.id === d.user_id),
      product: data.products.find((p) => p.id === d.product_id),
    })).filter((d) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (d.user?.full_name.toLowerCase().includes(s) || d.user?.email.toLowerCase().includes(s) || d.product?.title.toLowerCase().includes(s));
    });
  }, [data._v, productFilter, search]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Downloads</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total · realtime feed</p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user or product..." />
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="all">All products</option>
          {data.products.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="text-left">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 hidden md:table-cell">Email</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No downloads yet.</td></tr>
            )}
            {rows.map((d) => (
              <motion.tr key={d.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <img src={d.user?.avatar_url} className="h-7 w-7 rounded-full bg-muted" alt="" />
                    <span className="font-medium">{d.user?.full_name ?? "Unknown"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{d.user?.email}</td>
                <td className="px-4 py-3">{d.product?.title ?? "Deleted"}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(d.downloaded_at), "MMM d, HH:mm:ss")}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
