import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Gift, Crown, Coffee, Pizza, IceCream, Trophy, Star, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/loyalty")({
  head: () => ({
    meta: [
      { title: "Loyalty Rewards — RestaurantFlow" },
      { name: "description", content: "Earn points on every order and redeem them for free food, drinks and exclusive perks." },
      { property: "og:title", content: "RestaurantFlow Loyalty Rewards" },
      { property: "og:description", content: "Earn 1 point per Ksh spent. Redeem for meals, drinks and VIP perks." },
    ],
  }),
  component: LoyaltyPage,
});

const REDEEMED_KEY = "rf_loyalty_redeemed_v1";

type Reward = {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: typeof Gift;
  tone: "primary" | "warning" | "success" | "info";
};

const rewards: Reward[] = [
  { id: "drink", name: "Free Soft Drink", desc: "Any regular fountain drink, on us.", cost: 150, icon: Coffee, tone: "info" },
  { id: "side", name: "Free Side", desc: "Fries, coleslaw or mash — your pick.", cost: 300, icon: Gift, tone: "success" },
  { id: "meal", name: "Free Signature Meal", desc: "Any classic combo up to Ksh 800.", cost: 800, icon: Pizza, tone: "primary" },
  { id: "dessert", name: "Dessert of the Month", desc: "Chef's featured sweet treat.", cost: 250, icon: IceCream, tone: "warning" },
  { id: "vip", name: "VIP Skip-the-Line", desc: "Priority pickup for 30 days.", cost: 1500, icon: Crown, tone: "primary" },
  { id: "double", name: "Double Points Weekend", desc: "2× points on your next 3 orders.", cost: 500, icon: TrendingUp, tone: "info" },
];

const tiers = [
  { name: "Bronze", min: 0, color: "from-amber-700 to-amber-500" },
  { name: "Silver", min: 500, color: "from-slate-400 to-slate-200" },
  { name: "Gold", min: 1500, color: "from-yellow-500 to-amber-300" },
  { name: "Platinum", min: 3500, color: "from-fuchsia-500 to-violet-400" },
];

function useRedeemed() {
  const [redeemed, setRedeemed] = useState<{ id: string; rewardId: string; name: string; cost: number; at: string }[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REDEEMED_KEY);
      if (raw) setRedeemed(JSON.parse(raw));
    } catch {
      // ignore corrupt payload
    }
  }, []);
  const persist = (next: typeof redeemed) => {
    setRedeemed(next);
    try {
      localStorage.setItem(REDEEMED_KEY, JSON.stringify(next));
    } catch {
      // ignore quota
    }
  };
  return { redeemed, persist };
}

function LoyaltyPage() {
  const orders = useStore((s) => s.orders);
  const earned = orders.reduce((n, o) => n + (o.loyaltyPointsEarned ?? 0), 0);
  const { redeemed, persist } = useRedeemed();
  const spent = redeemed.reduce((n, r) => n + r.cost, 0);
  const balance = Math.max(0, earned - spent);

  const currentTierIdx = [...tiers].reverse().find((t) => balance >= t.min) ? tiers.findIndex((t) => t.name === [...tiers].reverse().find((x) => balance >= x.min)!.name) : 0;
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];
  const progressPct = nextTier
    ? Math.min(100, ((balance - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  const redeem = (r: Reward) => {
    if (balance < r.cost) {
      toast.error(`Need ${r.cost - balance} more points`);
      return;
    }
    persist([
      { id: `red_${Date.now()}`, rewardId: r.id, name: r.name, cost: r.cost, at: new Date().toISOString() },
      ...redeemed,
    ]);
    toast.success(`Redeemed: ${r.name}`);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero balance card */}
      <section
        className="relative overflow-hidden rounded-3xl p-8 text-primary-foreground shadow-glow"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute -right-10 -top-10 grid size-48 place-items-center rounded-full bg-white/10">
          <Sparkles className="size-24 text-white/20" />
        </div>
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Star className="size-3.5 fill-current" /> Loyalty Program
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Your rewards</h1>
          <p className="mt-1 text-sm text-white/80">Earn 1 point for every Ksh spent. Redeem below.</p>

          <div className="mt-6 flex flex-wrap items-end gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Points balance</p>
              <p className="text-5xl font-black tabular-nums">{balance.toLocaleString()}</p>
              <p className="mt-1 text-xs text-white/70">
                {earned.toLocaleString()} earned · {spent.toLocaleString()} redeemed
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Current tier</p>
              <p className="inline-flex items-center gap-2 text-2xl font-bold">
                <Trophy className="size-6" /> {currentTier.name}
              </p>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{currentTier.name}</span>
              <span>{nextTier ? `${nextTier.min - balance} pts to ${nextTier.name}` : "Max tier reached"}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tier ladder */}
      <section className="mt-8">
        <h2 className="text-lg font-bold">Membership tiers</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t, i) => {
            const active = i === currentTierIdx;
            const unlocked = balance >= t.min;
            return (
              <div
                key={t.name}
                className={cn(
                  "rounded-2xl border p-4 transition",
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : unlocked
                    ? "border-border bg-card"
                    : "border-dashed border-border bg-muted/40 opacity-70",
                )}
              >
                <div className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white", t.color)}>
                  <Trophy className="size-5" />
                </div>
                <p className="mt-3 font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">From {t.min.toLocaleString()} pts</p>
                {active && <p className="mt-2 text-xs font-bold text-primary">You are here</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Rewards catalog */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Rewards catalog</h2>
          <Link to="/menu" className="text-xs font-semibold text-primary hover:underline">
            Earn more points →
          </Link>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => {
            const Icon = r.icon;
            const canAfford = balance >= r.cost;
            return (
              <article
                key={r.id}
                className={cn(
                  "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition",
                  canAfford ? "hover:shadow-glow" : "opacity-75",
                )}
              >
                <div
                  className={cn(
                    "grid size-11 place-items-center rounded-xl",
                    r.tone === "primary" && "bg-primary/10 text-primary",
                    r.tone === "warning" && "bg-warning/20 text-warning-foreground",
                    r.tone === "success" && "bg-success/15 text-success",
                    r.tone === "info" && "bg-info/15 text-info",
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 font-bold">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                  <p className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    <Star className="size-3.5 fill-current" />
                    {r.cost.toLocaleString()} pts
                  </p>
                  <button
                    onClick={() => redeem(r)}
                    disabled={!canAfford}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold transition",
                      canAfford
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "cursor-not-allowed bg-muted text-muted-foreground",
                    )}
                  >
                    {canAfford ? "Redeem" : `+${(r.cost - balance).toLocaleString()} pts`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Activity */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold">Points earned</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No orders yet. Place one to start earning.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="inline-flex items-center gap-1 font-bold text-success">
                    +{o.loyaltyPointsEarned} <Star className="size-3.5 fill-current" />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold">Redemption history</h2>
          {redeemed.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing redeemed yet. Treat yourself above.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {redeemed.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-destructive">−{r.cost}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
