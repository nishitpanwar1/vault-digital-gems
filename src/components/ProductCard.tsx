import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import type { Product } from "@/lib/store";
import { StarRating } from "./StarRating";

const CATEGORY_LABELS: Record<Product["category"], string> = {
  ebooks: "E-Book",
  templates: "Template",
  bundles: "Bundle",
  courses: "Course",
};

export function ProductCard({
  product,
  avgRating = 0,
  reviewCount = 0,
  index = 0,
}: {
  product: Product;
  avgRating?: number;
  reviewCount?: number;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="card-hover group block overflow-hidden rounded-2xl border bg-card"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={product.cover_image_url}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
            {CATEGORY_LABELS[product.category]}
          </span>
          <span className="absolute right-3 top-3 rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
            {product.price === 0 ? "Free" : `$${product.price}`}
          </span>
        </div>
        <div className="space-y-2 p-5">
          <h3 className="line-clamp-1 font-semibold leading-tight">{product.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <StarRating value={avgRating} size={14} />
              <span className="text-xs text-muted-foreground">
                {reviewCount > 0 ? `(${reviewCount})` : "No reviews"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Download size={12} />
              {product.download_count.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
