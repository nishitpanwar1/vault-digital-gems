import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthLayout({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <span className="font-bold">DV</span>
            </div>
            <span className="text-lg font-semibold">DigitVault</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl font-bold leading-tight">
              Premium digital products,<br />all in one vault.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Join thousands of creators downloading curated e-books, templates, courses, and more.
            </p>
          </motion.div>
          <div className="text-xs text-primary-foreground/60">© DigitVault</div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">DV</span>
            </div>
            <span className="font-semibold">DigitVault</span>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function useAuthSubmit(fn: () => void) {
  const [loading, setLoading] = useState(false);
  return {
    loading,
    submit: async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try { fn(); } finally { setLoading(false); }
    },
  };
}

export { Button, Input, Label, useState, toast, useNavigate };
