import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Moon, Sun, User, X } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "@/lib/use-store";
import { logOut } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export function Navbar() {
  const user = useCurrentUser();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About" },
  ];

  function handleLogout() {
    logOut();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <span className="text-sm font-bold text-primary-foreground">DV</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">DigitVault</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === l.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link to="/dashboard" className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Dashboard
            </Link>
          )}
          {user?.is_admin && (
            <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:text-primary-glow">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/dashboard" className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
                <img src={user.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                <span className="text-sm">{user.full_name.split(" ")[0]}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                {l.label}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                Dashboard
              </Link>
            )}
            {user?.is_admin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-primary">
                Admin Panel
              </Link>
            )}
            {!user ? (
              <div className="flex gap-2 pt-2">
                <Link to="/auth/login" onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">Log in</Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setOpen(false)} className="flex-1">
                  <Button className="w-full gradient-primary text-primary-foreground" size="sm">Sign up</Button>
                </Link>
              </div>
            ) : (
              <Button variant="outline" onClick={() => { setOpen(false); handleLogout(); }} className="mt-2 w-full" size="sm">
                <LogOut size={14} className="mr-2" /> Sign out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">DV</span>
            </div>
            <span className="text-lg font-semibold">DigitVault</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium digital products for creators, founders, and dreamers.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Browse</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">All Products</Link></li>
            <li><Link to="/products" className="hover:text-foreground">E-Books</Link></li>
            <li><Link to="/products" className="hover:text-foreground">Templates</Link></li>
            <li><Link to="/products" className="hover:text-foreground">Courses</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link to="/auth/signup" className="hover:text-foreground">Create account</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">DigitVault</h4>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DigitVault. Built for makers.
          </p>
        </div>
      </div>
    </footer>
  );
}
