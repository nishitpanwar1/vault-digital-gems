import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
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
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("id, title, description, cover_image_url, price, category, download_count")
      .eq("id", params.id)
      .eq("is_published", true)
      .maybeSingle();
    return { product: data };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.product;
    const url = `https://vault-digital-gems.lovable.app/products/${params.id}`;
    if (!p) {
      return {
        meta: [
          { title: "Product not found — DigitVault" },
          { name: "description", content: "This digital product is no longer available on DigitVault." },
          { property: "og:url", content: url },
          { name: "robots", content: "noindex,follow" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const title = `${p.title} — DigitVault`.slice(0, 60);
    const baseDesc = (p.description || `${p.title} on DigitVault.`).replace(/\s+/g, " ").trim();
    const desc = (baseDesc.length < 50 ? `${baseDesc} Premium digital product on DigitVault — instant download.` : baseDesc).slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(p.cover_image_url
          ? [
              { property: "og:image", content: p.cover_image_url },
              { name: "twitter:image", content: p.cover_image_url },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.title,
            description: baseDesc,
            image: p.cover_image_url || undefined,
            category: p.category,
            url,
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url,
            },
          }),
        },
      ],
    };
  },
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

  const gallery = useMemo(() => {
    const items: { type: "image" | "video"; url: string }[] = [
      { type: "image", url: product.cover_image_url },
      ...(product.media ?? []),
    ];
    return items.filter((m) => !!m.url);
  }, [product.cover_image_url, product.media]);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = gallery[Math.min(activeIdx, gallery.length - 1)] ?? gallery[0];

  const related = data.products
    .filter((p) => p.id !== id && p.category === product.category && p.is_published)
    .slice(0, 3);

  async function handleDownload() {
    if (!user) {
      toast.error("Please sign in to download");
      nav({ to: "/auth/login" });
      return;
    }
    try {
      await recordDownload(user.id, id);
      let url = product!.file_url;
      if (url.startsWith("storage:")) {
        const [, bucketAndPath] = url.split("storage:");
        const [bucket, ...rest] = bucketAndPath.split("/");
        const path = rest.join("/");
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60, { download: true });
        if (error || !data) throw error || new Error("Could not sign URL");
        url = data.signedUrl;
      }
      window.open(url, "_blank");
      toast.success(`Downloading "${product!.title}"...`);
    } catch (e: any) {
      toast.error(e?.message || "Download failed");
    }
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
            className="space-y-3"
          >
            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border bg-muted shadow-glow">
              {active?.type === "video" ? (
                <video src={active.url} controls className="h-full w-full object-contain" />
              ) : (
                <img src={active?.url} alt={product.title} className="h-full w-full object-contain" />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted transition ${
                      i === activeIdx ? "ring-2 ring-primary" : "hover:opacity-80"
                    }`}
                    aria-label={`Show ${m.type} ${i + 1}`}
                  >
                    {m.type === "video" ? (
                      <>
                        <video src={m.url} className="h-full w-full object-cover" muted />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-medium text-white">▶</span>
                      </>
                    ) : (
                      <img src={m.url} alt="" className="h-full w-full object-contain" />
                    )}
                  </button>
                ))}
              </div>
            )}
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
