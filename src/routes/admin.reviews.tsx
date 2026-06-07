import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { StarRating } from "@/components/StarRating";
import { useDB } from "@/lib/use-store";
import { deleteReview } from "@/lib/store";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — DigitVault Admin" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const data = useDB();
  const rows = [...data.reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((r) => ({
      ...r,
      user: data.profiles.find((p) => p.id === r.user_id),
      product: data.products.find((p) => p.id === r.product_id),
    }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total · realtime feed</p>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">No reviews yet.</div>
        )}
        {rows.map((r) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <img src={r.user?.avatar_url} className="h-9 w-9 shrink-0 rounded-full bg-muted" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.user?.full_name ?? "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">on</span>
                    <span className="text-sm text-foreground/80">{r.product?.title ?? "Deleted product"}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating value={r.rating} size={12} />
                    <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy HH:mm")}</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
                </div>
              </div>
              <button
                onClick={() => { if (confirm("Delete this review?")) { deleteReview(r.id); toast.success("Deleted"); } }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
