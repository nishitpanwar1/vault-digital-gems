import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Navbar, Footer } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ReviewSection } from "@/components/ReviewSection";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useDB } from "@/lib/use-store";
import { hasDownloaded, recordDownload } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
          ← Back to products
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => <div className="p-20 text-center">Something went wrong.</div>,
});

const CATEGORY_LABELS = {
  ebooks: "E-Book",
  templates: "Template",
  bundles: "Bundle",
  courses: "Course",
} as const;

function ProductDetail() {
  const { id } = Route.useParams();
  const data = useDB();
  const user = useCurrentUser();
  const nav = useNavigate();

  const product = data.products.find((p) => p.id === id);
  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Product not found</h1>
        </div>
      </div>
    );
  }

  const reviews = data.reviews.filter((r) => r.product_id === id);
  const avg = reviews.length === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const downloaded = user ? hasDownloaded(user.id, id) : false;

  const related = data.products
    .filter((p) => p.id !== id && p.category === product.category && p.is_published)
    .slice(0, 3);

  function handleDownload() {
    if (!user) {
      toast.error("Please sign in to download");
      nav({ to: "/auth/login" });
      return;
    }
    recordDownload(user.id, id);
    toast.success(`Downloading "${product!.title}"...`);
  }

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: product!.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to products
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border bg-card shadow-glow"
          >
            <img src={product.cover_image_url} alt={product.title} className="aspect-[4/3] w-full object-cover" />
          </motion.div>

          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {CATEGORY_LABELS[product.category]}
              </span>
              {product.price === 0 ? (
                <span className="rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Free</span>
              ) : (
                <span className="text-2xl font-bold gradient-text">${product.price}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{product.title}</h1>

            <div className="flex items-center gap-3">
              <StarRating value={avg} size={16} />
              <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"} · {product.download_count.toLocaleString()} downloads
              </span>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleDownload}
                className={downloaded ? "" : "gradient-primary text-primary-foreground shadow-glow"}
                variant={downloaded ? "outline" : "default"}
              >
                {downloaded ? <Check size={16} className="mr-2" /> : <Download size={16} className="mr-2" />}
                {downloaded ? "Downloaded — get again" : product.price === 0 ? "Download free" : "Download now"}
              </Button>
              <Button size="lg" variant="outline" onClick={share}>
                <Share2 size={16} className="mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Ratings & reviews</h2>
          <ReviewSection productId={id} currentUser={user} />
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">Related products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
