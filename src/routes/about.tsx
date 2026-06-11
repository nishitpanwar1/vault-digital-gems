import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Youtube, Sparkles, Target, Heart } from "lucide-react";
import { Navbar, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Nishit Panwar | DigitVault" },
      { name: "description", content: "Meet Nishit Panwar, founder of DigitVault and creator behind the DISCIPLINE4_YOU YouTube channel building discipline-focused content." },
      { property: "og:title", content: "About — Nishit Panwar | DigitVault" },
      { property: "og:description", content: "Meet Nishit Panwar, founder of DigitVault and creator behind DISCIPLINE4_YOU." },
      { property: "og:url", content: "https://vault-digital-gems.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://vault-digital-gems.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent)]" />
        <div className="container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles size={12} className="text-primary" /> About the founder
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Hi, I'm <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Nishit Panwar</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Builder, creator, and the person behind DigitVault & the <strong className="text-foreground">DISCIPLINE4_YOU</strong> YouTube channel.
              I help people level up their mindset, productivity, and digital craft.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square overflow-hidden rounded-3xl border bg-card shadow-glow"
        >
          <img
            src="https://api.dicebear.com/7.x/initials/svg?seed=Nishit%20Panwar&backgroundColor=6C3DFF"
            alt="Nishit Panwar"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">My story</h2>
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>
              I started DigitVault with one goal: make premium digital products that actually move the needle —
              no fluff, no recycled content, no overpriced bundles. Just tools and resources I'd actually use myself.
            </p>
            <p>
              Alongside the store, I run <strong className="text-foreground">DISCIPLINE4_YOU</strong> on YouTube, where I share
              what I'm learning about discipline, money, mindset, and building things online. The channel and the store
              feed into each other — the videos teach the why, the products give you the how.
            </p>
            <p>
              If any of that resonates, you're in the right place. Browse the catalog, watch the videos, and let's build.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="https://www.youtube.com/@DISCIPLINE4_YOU" target="_blank" rel="noreferrer">
              <Button className="gap-2 bg-red-600 text-white hover:bg-red-700">
                <Youtube size={18} /> Visit YouTube Channel
              </Button>
            </a>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                Explore Products
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="border-t bg-card/30">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">What I stand for</h2>
            <p className="mt-3 text-muted-foreground">A few principles that shape everything here.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: "Discipline > motivation", body: "Consistency beats hype. Every product and video reflects that." },
              { icon: Sparkles, title: "Craft over noise", body: "Less, but better. I'd rather ship one excellent thing than ten mediocre ones." },
              { icon: Heart, title: "Made for real people", body: "Built by a creator, for creators, founders, and self-improvers." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border bg-background p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-glow">
                  <v.icon size={20} className="text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-red-600/10 via-background to-primary/10 p-8 md:p-12"
        >
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-600/15 px-3 py-1 text-xs font-medium text-red-500">
                <Youtube size={14} /> DISCIPLINE4_YOU
              </div>
              <h3 className="text-2xl font-semibold md:text-3xl">Watch the latest videos</h3>
              <p className="mt-2 text-muted-foreground">
                New videos every week on discipline, mindset, and building an online life worth waking up for.
              </p>
            </div>
            <a href="https://www.youtube.com/@DISCIPLINE4_YOU?sub_confirmation=1" target="_blank" rel="noreferrer">
              <Button size="lg" className="gap-2 bg-red-600 text-white hover:bg-red-700">
                <Youtube size={20} /> Subscribe
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
