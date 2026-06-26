import { Link } from "@tanstack/react-router";
import { ShoppingCart, ChefHat, BellRing, LayoutDashboard, Utensils, Users } from "lucide-react";
import { useStore, session } from "@/lib/store";
import { cn } from "@/lib/utils";

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
        </div>
      </div>
    </header>
  );
}
