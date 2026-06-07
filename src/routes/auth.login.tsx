import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logIn } from "@/lib/store";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in — DigitVault" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const u = logIn(email, password);
      toast.success(`Welcome back, ${u.full_name.split(" ")[0]}!`);
      nav({ to: u.is_admin ? "/admin" : "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your downloads and reviews."
      footer={
        <>Don't have an account? <Link to="/auth/signup" className="font-medium text-primary hover:underline">Sign up</Link></>
      }
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
        <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-glow">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
