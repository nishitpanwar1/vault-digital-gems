import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logIn, refreshAll } from "@/lib/store";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Log in — DigitVault" },
      { name: "description", content: "Sign in to your DigitVault account to access your downloads, reviews, and purchased digital products." },
      { property: "og:title", content: "Log in — DigitVault" },
      { property: "og:description", content: "Sign in to access your DigitVault downloads and account." },
      { property: "og:url", content: "https://vault-digital-gems.lovable.app/auth/login" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://vault-digital-gems.lovable.app/auth/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await logIn(email, password);
      toast.success("Welcome back!");
      nav({ to: email.trim().toLowerCase() === "nishitpanwar@gmail.com" ? "/admin" : "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      await refreshAll();
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message || "Google sign-in failed");
    }
  }


  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your downloads and reviews."
      footer={<>Don't have an account? <Link to="/auth/signup" className="font-medium text-primary hover:underline">Sign up</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-glow">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
      </div>

      <Button type="button" variant="outline" onClick={google} className="w-full">
        Continue with Google
      </Button>
    </AuthLayout>
  );
}
