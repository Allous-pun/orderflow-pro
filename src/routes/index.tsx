import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Clock, Star } from "lucide-react";
import { menuItems } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RestaurantFlow — Order, Cook, Serve in One Flow" },
      { name: "description", content: "Modern restaurant management — kiosk ordering, kitchen display, waiter app and manager analytics." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const featured = menuItems.filter((m) => m.isFeatured).slice(0, 4);
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-warm)", opacity: 0.12 }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="animate-[slideUp_0.5s_ease-out]">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="size-3.5 text-primary" /> Self-order kiosk
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Skip the line.<br />
              <span className="text-primary">Taste the flow.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Tap the menu, pick your meal, choose your table — your food finds you. Pay now or pay when you leave.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
              >
                Order Now <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition hover:bg-muted"
              >
                Browse Menu
              </Link>
            </div>
            <div className="mt-10 flex gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="size-4 text-primary" /> Avg 12 min</div>
              <div className="flex items-center gap-2"><Star className="size-4 text-primary" /> 4.8 / 5</div>
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Loyalty pts</div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {featured.map((m, i) => (
                <div
                  key={m.id}
                  className="overflow-hidden rounded-2xl bg-card shadow-md"
                  style={{ transform: `translateY(${i % 2 ? 24 : 0}px)` }}
                >
                  <img src={m.image} alt={m.name} className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Ksh {m.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { n: "01", t: "Tap & order", d: "Browse the menu, pick modifiers" },
            { n: "02", t: "Pick your table", d: "Enter table # or takeaway" },
            { n: "03", t: "Pay now or later", d: "M-Pesa, card, cash" },
            { n: "04", t: "We bring it", d: "Auto-assigned waiter delivers" },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-bold text-primary">{s.n}</div>
              <div className="mt-2 text-lg font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
