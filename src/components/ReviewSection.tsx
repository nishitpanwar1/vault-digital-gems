import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { useDB } from "@/lib/use-store";
import {
  upsertReview,
  deleteReview,
  type Profile,
  type Review,
} from "@/lib/store";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

export function ReviewSection({
  productId,
  currentUser,
}: {
  productId: string;
  currentUser: Profile | null;
}) {
  const data = useDB();
  const reviews = data.reviews.filter((r) => r.product_id === productId);
  const myReview = currentUser
    ? reviews.find((r) => r.user_id === currentUser.id)
    : undefined;

  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [sort, setSort] = useState<"recent" | "rating">("recent");

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview?.id]);

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const sorted = [...reviews].sort((a, b) =>
    sort === "recent"
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : b.rating - a.rating,
  );

  function submit() {
    if (!currentUser) return;
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    upsertReview({
      user_id: currentUser.id,
      product_id: productId,
      rating,
      comment: comment.trim(),
    });
    toast.success(myReview ? "Review updated" : "Review posted");
  }

  function getProfile(id: string) {
    return data.profiles.find((p) => p.id === id);
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 rounded-2xl border bg-card p-6 md:grid-cols-2">
        <div className="text-center md:border-r md:pr-6">
          <div className="text-5xl font-bold gradient-text">
            {avg.toFixed(1)}
          </div>
          <StarRating value={avg} size={20} className="mt-2 justify-center" />
          <p className="mt-2 text-sm text-muted-foreground">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((b) => {
            const pct =
              reviews.length === 0 ? 0 : (b.count / reviews.length) * 100;
            return (
              <div key={b.star} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-muted-foreground">{b.star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full gradient-primary"
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{b.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {currentUser ? (
        <div className="space-y-3 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {myReview ? "Edit your review" : "Write a review"}
            </h3>
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you thought about this product..."
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{comment.length}/1000</span>
            <div className="flex gap-2">
              {myReview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    deleteReview(myReview.id);
                    setComment("");
                    setRating(5);
                    toast.success("Review removed");
                  }}
                >
                  Delete
                </Button>
              )}
              <Button onClick={submit} size="sm" className="gradient-primary text-primary-foreground">
                <Send size={14} className="mr-1.5" />
                {myReview ? "Update" : "Post review"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">All reviews</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "recent" | "rating")}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          <option value="recent">Most recent</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No reviews yet. Be the first!
          </p>
        )}
        {sorted.map((r: Review) => {
          const author = getProfile(r.user_id);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={author?.avatar_url ?? ""}
                  alt=""
                  className="h-9 w-9 rounded-full bg-muted"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{author?.full_name ?? "Anonymous"}</div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <StarRating value={r.rating} size={12} className="mt-0.5" />
                  <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
