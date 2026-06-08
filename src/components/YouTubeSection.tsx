import { motion } from "framer-motion";
import { Play, Youtube } from "lucide-react";

const CHANNEL_URL = "https://www.youtube.com/@DISCIPLINE4_YOU";
const CHANNEL_HANDLE = "@DISCIPLINE4_YOU";

// Latest videos from the channel — edit this list anytime.
const VIDEOS: { id: string; title: string }[] = [
  { id: "J2SIz_CwW0E", title: "KEEP IT UP" },
  { id: "CreIjHlhUS8", title: "ANY EXCUSES?" },
  { id: "VZABemyk1pY", title: "REMEMBER THE PROMISE" },
  { id: "gLmLtD1D8z8", title: "YOU'RE THE LAST HOPE" },
  { id: "LQp9Uw7kP9A", title: "STAY HARD" },
  { id: "uy4_4u8vZOo", title: "NO ONE IS COMING" },
];

export function YouTubeSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur">
          <Youtube size={14} className="text-[#FF0033]" />
          From our YouTube channel
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Daily <span className="gradient-text">Discipline</span> & Motivation
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Watch the latest drops from{" "}
          <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
            {CHANNEL_HANDLE}
          </a>{" "}
          — bite-sized clips to keep you locked in.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {VIDEOS.map((v, i) => (
          <motion.a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative block overflow-hidden rounded-2xl border bg-card shadow-glow"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF0033] shadow-glow transition-transform group-hover:scale-110">
                  <Play size={22} className="ml-0.5 fill-white text-white" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                {v.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">{CHANNEL_HANDLE}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#FF0033] px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          <Youtube size={16} /> Subscribe on YouTube
        </a>
      </div>
    </section>
  );
}
