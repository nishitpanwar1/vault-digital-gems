import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Users, Package, Download, MessageSquare, TrendingUp, UserPlus } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useDB } from "@/lib/use-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — DigitVault" }] }),
  component: AdminOverview,
});

function useAnimatedNumber(value: number) {
  const [n, setN] = useState(value);
  useEffect(() => {
    const start = n;
    const diff = value - start;
    if (diff === 0) return;
    const t0 = performance.now();
    const dur = 500;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(start + diff * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return n;
}

function StatCard({ icon: Icon, label, value, delta }: { icon: any; label: string; value: number; delta?: string }) {
  const n = useAnimatedNumber(value);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon size={16} className="text-primary" />
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{n.toLocaleString()}</div>
      {delta && <p className="mt-1 text-xs text-success">{delta}</p>}
    </motion.div>
  );
}

function AdminOverview() {
  const data = useDB();
  const today = startOfDay(new Date()).getTime();

  const stats = {
    users: data.profiles.length,
    products: data.products.length,
    downloads: data.downloads.length,
    reviews: data.reviews.length,
    downloadsToday: data.downloads.filter((d) => new Date(d.downloaded_at).getTime() >= today).length,
    signupsToday: data.profiles.filter((p) => new Date(p.created_at).getTime() >= today).length,
  };

  const downloadsByDay = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const day = startOfDay(subDays(new Date(), 29 - i));
      const next = day.getTime() + 86400000;
      return {
        date: format(day, "MMM d"),
        downloads: data.downloads.filter((d) => {
          const t = new Date(d.downloaded_at).getTime();
          return t >= day.getTime() && t < next;
        }).length,
      };
    });
    return days;
  }, [data._v]);

  const signupsByDay = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = startOfDay(subDays(new Date(), 29 - i));
      const next = day.getTime() + 86400000;
      return {
        date: format(day, "MMM d"),
        signups: data.profiles.filter((p) => {
          const t = new Date(p.created_at).getTime();
          return t >= day.getTime() && t < next;
        }).length,
      };
    });
  }, [data._v]);

  const topProducts = useMemo(() => {
    return [...data.products]
      .sort((a, b) => b.download_count - a.download_count)
      .slice(0, 5)
      .map((p) => ({ name: p.title.length > 22 ? p.title.slice(0, 22) + "…" : p.title, downloads: p.download_count }));
  }, [data._v]);

  const activity = useMemo(() => {
    const items: { id: string; type: string; text: string; time: string }[] = [];
    data.profiles.slice(-5).forEach((p) => items.push({ id: "u" + p.id, type: "signup", text: `${p.full_name} signed up`, time: p.created_at }));
    data.downloads.slice(0, 5).forEach((d) => {
      const u = data.profiles.find((x) => x.id === d.user_id);
      const pr = data.products.find((x) => x.id === d.product_id);
      items.push({ id: "d" + d.id, type: "download", text: `${u?.full_name ?? "User"} downloaded ${pr?.title ?? "a product"}`, time: d.downloaded_at });
    });
    data.reviews.slice(0, 5).forEach((r) => {
      const u = data.profiles.find((x) => x.id === r.user_id);
      const pr = data.products.find((x) => x.id === r.product_id);
      items.push({ id: "r" + r.id, type: "review", text: `${u?.full_name ?? "User"} reviewed ${pr?.title ?? "a product"} (${r.rating}★)`, time: r.created_at });
    });
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }, [data._v]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Live metrics across DigitVault.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} delta={stats.signupsToday > 0 ? `+${stats.signupsToday} today` : undefined} />
        <StatCard icon={Package} label="Products" value={stats.products} />
        <StatCard icon={Download} label="Downloads" value={stats.downloads} delta={stats.downloadsToday > 0 ? `+${stats.downloadsToday} today` : undefined} />
        <StatCard icon={MessageSquare} label="Reviews" value={stats.reviews} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><TrendingUp size={14} /> Downloads — last 30 days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} interval={4} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="downloads" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><UserPlus size={14} /> Signups</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupsByDay}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} interval={6} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="signups" stroke="var(--color-primary)" fill="url(#signupGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Top 5 most downloaded</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={140} stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="downloads" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Recent activity</h3>
          <ul className="space-y-3">
            {activity.length === 0 && <li className="text-xs text-muted-foreground">No activity yet.</li>}
            {activity.map((a) => (
              <motion.li key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 text-xs">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  a.type === "signup" ? "bg-success" : a.type === "download" ? "bg-primary" : "bg-warning"
                }`} />
                <div>
                  <p className="text-foreground/90">{a.text}</p>
                  <p className="text-muted-foreground/70">{format(new Date(a.time), "MMM d, HH:mm")}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
