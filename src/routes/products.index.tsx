import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Navbar, Footer } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { useDB } from "@/lib/use-store";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Browse Digital Products — DigitVault" },
      { name: "description", content: "Explore all premium digital products on DigitVault: e-books, templates, courses, and bundles for creators and founders." },
      { property: "og:title", content: "Browse Digital Products — DigitVault" },
      { property: "og:description", content: "Explore all premium digital products: e-books, templates, courses, and bundles." },
      { property: "og:url", content: "https://vault-digital-gems.lovable.app/products" },
    ],
    links: [{ rel: "canonical", href: "https://vault-digital-gems.lovable.app/products" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Browse Digital Products",
          url: "https://vault-digital-gems.lovable.app/products",
          isPartOf: { "@type": "WebSite", name: "DigitVault", url: "https://vault-digital-gems.lovable.app" },
          about: "E-books, templates, courses, and bundles for creators and founders.",
        }),
      },
    ],
  }),
  component: ProductsPage,
});

const CATS = ["all", "ebooks", "templates", "bundles", "courses"] as const;
const PRICES = ["all", "free", "paid"] as const;
const SORTS = ["latest", "downloads", "rating"] as const;

function ProductsPage() {
  const data = useDB();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const [price, setPrice] = useState<(typeof PRICES)[number]>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("latest");

  const ratings = useMemo(() => {
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

  const filtered = useMemo(() => {
    let list = data.products.filter((p) => p.is_published);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s),
      );
    }
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (price === "free") list = list.filter((p) => p.price === 0);
    if (price === "paid") list = list.filter((p) => p.price > 0);
    if (sort === "downloads") list = [...list].sort((a, b) => b.download_count - a.download_count);
    else if (sort === "rating") list = [...list].sort((a, b) => (ratings[b.id]?.avg ?? 0) - (ratings[a.id]?.avg ?? 0));
    else list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [data._v, q, cat, price, sort, ratings]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All products</h1>
          <p className="mt-2 text-muted-foreground">Browse our full catalog of digital goods.</p>
        </div>

        <div className="mb-8 space-y-4 rounded-2xl border bg-card p-5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products by title or description..."
              className="pl-9"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Category" value={cat} onChange={(v) => setCat(v as typeof cat)} options={CATS.map((c) => ({ value: c, label: c === "all" ? "All" : c[0].toUpperCase() + c.slice(1) }))} />
            <Select label="Price" value={price} onChange={(v) => setPrice(v as typeof price)} options={PRICES.map((c) => ({ value: c, label: c === "all" ? "All" : c[0].toUpperCase() + c.slice(1) }))} />
            <Select label="Sort by" value={sort} onChange={(v) => setSort(v as typeof sort)} options={[
              { value: "latest", label: "Latest" },
              { value: "downloads", label: "Most downloaded" },
              { value: "rating", label: "Top rated" },
            ]} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No products match your filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                avgRating={ratings[p.id]?.avg ?? 0}
                reviewCount={ratings[p.id]?.count ?? 0}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
