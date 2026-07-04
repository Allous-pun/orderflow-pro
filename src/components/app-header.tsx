import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingCart, ChefHat, BellRing, LayoutDashboard, Utensils, Users, Sparkles, Shield, Wand2, LogIn, LogOut } from "lucide-react";
import { useStore, session } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getSession, clearSession, type AuthSession } from "@/lib/mock-users";
import { toast } from "sonner";

const roles = [
  { id: "customer", label: "Customer", icon: Utensils, to: "/menu" },
  { id: "waiter", label: "Waiter", icon: Users, to: "/waiter" },
  { id: "kitchen", label: "Kitchen", icon: ChefHat, to: "/kitchen" },
  { id: "manager", label: "Manager", icon: LayoutDashboard, to: "/manager" },
] as const;

export function AppHeader() {
  const cartCount = useStore((s) => s.cart.reduce((n, i) => n + i.quantity, 0));
  const activeRole = useStore((s) => s.activeRole);
  const activeUserId = useStore((s) => s.activeUserId);
  const unread = useStore(
    (s) => s.notifications.filter((n) => n.userId === activeUserId && !n.read).length,
  );

  const [auth, setAuth] = useState<AuthSession | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const sync = () => setAuth(getSession());
    sync();
    window.addEventListener("rf-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rf-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function signOut() {
    clearSession();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div
            className="grid size-9 place-items-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Utensils className="size-5" />
          </div>
          <span className="text-lg tracking-tight">
            Restaurant<span className="text-primary">Flow</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {roles.map((r) => {
            const Icon = r.icon;
            const active = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => session.setRole(r.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Link to={r.to}>
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-4" />
                    {r.label}
                  </span>
                </Link>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/setup"
            className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 sm:inline-flex"
          >
            <Wand2 className="size-3.5" /> Setup
          </Link>
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 sm:inline-flex"
          >
            <Shield className="size-3.5" /> Admin
          </Link>
          <Link
            to="/loyalty"
            className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 sm:inline-flex"
          >
            <Sparkles className="size-3.5" /> Rewards
          </Link>
          {unread > 0 && (
            <div className="relative grid size-9 place-items-center rounded-full bg-muted">
              <BellRing className="size-4 text-primary" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            </div>
          )}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:opacity-90"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {auth ? (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2">
              <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {auth.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden text-xs leading-tight sm:block">
                <div className="font-semibold">{auth.name.split(" ")[0]}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {auth.role}
                </div>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="ml-1 grid size-7 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
            >
              <LogIn className="size-3.5" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
