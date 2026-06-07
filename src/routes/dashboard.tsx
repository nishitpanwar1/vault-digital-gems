import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Navbar, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/StarRating";
import { useCurrentUser, useDB } from "@/lib/use-store";
import { deleteReview, updateProfile } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DigitVault" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useCurrentUser();
  const data = useDB();
  const nav = useNavigate();

  useEffect(() => {
    if (user === null) nav({ to: "/auth/login" });
  }, [user, nav]);

  const [name, setName] = useState(user?.full_name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar_url ?? "");

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setAvatar(user.avatar_url);
    }
  }, [user?.id]);

  if (!user) return null;

  const myDownloads = data.downloads
    .filter((d) => d.user_id === user.id)
    .map((d) => ({ ...d, product: data.products.find((p) => p.id === d.product_id) }))
    .filter((d) => d.product);

  const myReviews = data.reviews
    .filter((r) => r.user_id === user.id)
    .map((r) => ({ ...r, product: data.products.find((p) => p.id === r.product_id) }))
    .filter((r) => r.product);

  function saveProfile() {
    updateProfile(user!.id, { full_name: name.trim() || user!.full_name, avatar_url: avatar.trim() || user!.avatar_url });
    toast.success("Profile updated");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-5 rounded-2xl border bg-card p-6">
          <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full bg-muted" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.full_name}</h1>
            <p className="text-sm text-muted-foreground">{user.email} · Joined {format(new Date(user.created_at), "MMM d, yyyy")}</p>
          </div>
          {user.is_admin && (
            <Link to="/admin">
              <Button className="gradient-primary text-primary-foreground">Admin panel</Button>
            </Link>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Download size={18} /> My downloads ({myDownloads.length})
              </h2>
              {myDownloads.length === 0 ? (
                <p className="text-sm text-muted-foreground">You haven't downloaded anything yet. <Link to="/products" className="text-primary hover:underline">Browse products</Link></p>
              ) : (
                <ul className="divide-y">
                  {myDownloads.map((d) => (
                    <li key={d.id} className="flex items-center gap-4 py-3">
                      <img src={d.product!.cover_image_url} alt="" className="h-12 w-16 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <Link to="/products/$id" params={{ id: d.product!.id }} className="line-clamp-1 font-medium hover:text-primary">
                          {d.product!.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">Downloaded {format(new Date(d.downloaded_at), "MMM d, yyyy")}</p>
                      </div>
                      <Link to="/products/$id" params={{ id: d.product!.id }}>
                        <Button variant="outline" size="sm">Re-download</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Edit2 size={18} /> My reviews ({myReviews.length})
              </h2>
              {myReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">You haven't reviewed any products yet.</p>
              ) : (
                <ul className="divide-y">
                  {myReviews.map((r) => (
                    <li key={r.id} className="py-4">
                      <div className="flex items-center justify-between gap-2">
                        <Link to="/products/$id" params={{ id: r.product!.id }} className="line-clamp-1 font-medium hover:text-primary">
                          {r.product!.title}
                        </Link>
                        <button
                          onClick={() => { deleteReview(r.id); toast.success("Review deleted"); }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <StarRating value={r.rating} size={12} className="mt-1" />
                      <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Account settings</h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dn">Full name</Label>
                  <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="av">Avatar URL</Label>
                  <Input id="av" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
                </div>
                <Button onClick={saveProfile} className="w-full gradient-primary text-primary-foreground">Save</Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
