import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Download, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Navbar, Footer } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { YouTubeSection } from "@/components/YouTubeSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB } from "@/lib/use-store";
import { addSubscriber } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DigitVault — Premium Digital Products for Creators" },
      { name: "description", content: "E-books, templates, courses, and bundles curated for makers. Browse free and paid digital products on DigitVault — instant download." },
      { name: "keywords", content: "digital products, ebooks, templates, online courses, creator marketplace, digital downloads, notion templates" },
      { property: "og:title", content: "DigitVault — Premium Digital Products" },
      { property: "og:description", content: "E-books, templates, courses, and bundles curated for makers and founders." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vault-digital-gems.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DigitVault — Premium Digital Products" },
      { name: "twitter:description", content: "E-books, templates, courses, and bundles curated for makers." },
    ],
    links: [{ rel: "canonical", href: "https://vault-digital-gems.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "DigitVault — Premium Digital Products",
          url: "https://vault-digital-gems.lovable.app/",
          description: "Hand-curated e-books, templates, courses, and bundles for creators and founders.",
          isPartOf: { "@type": "WebSite", name: "DigitVault", url: "https://vault-digital-gems.lovable.app" },
          about: ["E-books", "Templates", "Online Courses", "Digital Bundles"],
        }),
      },
    ],
  }),
  component: HomePage,
});

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "ebooks", label: "E-Books" },
  { key: "templates", label: "Templates" },
  { key: "bundles", label: "Bundles" },
  { key: "courses", label: "Courses" },
] as const;

function HomePage() {
  const data = useDB();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["key"]>("all");
  const [email, setEmail] = useState("");

  const published = data.products.filter((p) => p.is_published);
  const filtered = cat === "all" ? published : published.filter((p) => p.category === cat);
  const featured = filtered.slice(0, 6);

  const reviewsByProduct = useMemo(() => {
    const map: Record<string, { avg: number; count: number }> = {};
    for (const p of data.products) {
      const rs = data.reviews.filter((r) => r.product_id === p.id);
      map[p.id] = {
        count: rs.length,
        avg: rs.length === 0 ? 0 : rs.reduce((s, r) => s + r.rating, 0) / rs.length,
      };
    }
    return map;
  }, [data._v]);

  const stats = {
    products: published.length,
    downloads: data.downloads.length + published.reduce((s, p) => s + p.download_count, 0),
    users: Math.max(data.profiles.length, 1),
  };

  const topReviews = [...data.reviews]
    .filter((r) => r.rating >= 4 && r.comment.length > 20)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full gradient-primary blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles size={12} className="text-primary" />
              Premium digital products marketplace
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Discover <span className="gradient-text">premium</span> digital products
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Hand-curated e-books, templates, and courses to help you ship faster and create better.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/products">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                  Browse Products <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="lg" variant="outline">Sign up free</Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            {[
              { icon: Sparkles, label: "Products", value: stats.products },
              { icon: Download, label: "Downloads", value: stats.downloads },
              { icon: Users, label: "Members", value: stats.users },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-2xl border bg-card/60 p-5 text-center backdrop-blur"
              >
                <s.icon size={18} className="mx-auto text-primary" />
                <div className="mt-2 text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured products</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest drops from our creators.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-full border bg-card p-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  cat === c.key
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {featured.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                avgRating={reviewsByProduct[p.id]?.avg ?? 0}
                reviewCount={reviewsByProduct[p.id]?.count ?? 0}
                index={i}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/products">
            <Button variant="outline">View all products <ArrowRight size={14} className="ml-1.5" /></Button>
          </Link>
        </div>
      </section>

      {/* YouTube */}
      <YouTubeSection />

      {/* Testimonials */}
      {topReviews.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Loved by our community</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {topReviews.map((r) => {
              const author = data.profiles.find((p) => p.id === r.user_id);
              const product = data.products.find((p) => p.id === r.product_id);
              return (
                <div key={r.id} className="rounded-2xl border bg-card p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-foreground/90">"{r.comment}"</p>
                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    <img src={author?.avatar_url ?? ""} className="h-8 w-8 rounded-full bg-muted" alt="" />
                    <div>
                      <div className="text-sm font-medium">{author?.full_name ?? "Anonymous"}</div>
                      <div className="text-xs text-muted-foreground">on {product?.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl gradient-primary p-1 shadow-glow">
          <div className="rounded-[calc(theme(borderRadius.3xl)-4px)] bg-card px-8 py-10 text-center">
            <h3 className="text-2xl font-bold">Get new drops in your inbox</h3>
            <p className="mt-2 text-sm text-muted-foreground">No spam. Just new digital products and weekly inspiration.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) return toast.error("Enter a valid email");
                addSubscriber(email);
                setEmail("");
                toast.success("Subscribed!");
              }}
              className="mx-auto mt-5 flex max-w-md gap-2"
            >
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
              />
              <Button type="submit" className="gradient-primary text-primary-foreground">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
