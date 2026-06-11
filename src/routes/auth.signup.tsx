import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/store";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create account — DigitVault" },
      { name: "description", content: "Create a free DigitVault account to download digital products, leave reviews, and track your purchases." },
      { property: "og:title", content: "Create account — DigitVault" },
      { property: "og:description", content: "Sign up free to download e-books, templates, courses, and bundles." },
      { property: "og:url", content: "https://vault-digital-gems.lovable.app/auth/signup" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://vault-digital-gems.lovable.app/auth/signup" }],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Please enter your name");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await signUp({ full_name: fullName, email, password });
      toast.success("Account created!");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message);
    if (!result.redirected && !result.error) nav({ to: "/dashboard" });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join DigitVault to start downloading premium products."
      footer={<>Already have an account? <Link to="/auth/login" className="font-medium text-primary hover:underline">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="name">Full name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus /></div>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-glow">
          {loading ? "Creating..." : "Create account"}
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
