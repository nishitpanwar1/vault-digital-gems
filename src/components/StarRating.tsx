import { Star, StarHalf } from "lucide-react";

export function StarRating({
  value,
  size = 16,
  onChange,
  className = "",
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars.map((s) => {
        const filled = value >= s;
        const half = !filled && value >= s - 0.5;
        const Cmp = half ? StarHalf : Star;
        return (
          <button
            key={s}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(s)}
            className={onChange ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            <Cmp
              size={size}
              className={
                filled || half
                  ? "fill-warning text-warning"
                  : "fill-transparent text-muted-foreground/40"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
