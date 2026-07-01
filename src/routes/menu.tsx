import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { categories, menuItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — RestaurantFlow" },
      { name: "description", content: "Browse our full menu of burgers, chicken, salads, sides, drinks and desserts." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const filtered = menuItems.filter(
    (m) =>
      (!activeCat || m.categoryId === activeCat) &&
      (!q || m.name.toLowerCase().includes(q.toLowerCase()) || m.description.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick something delicious — modifiers available on every item.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search menu…"
            className="w-full rounded-full border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCat(null)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
            !activeCat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted",
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeCat === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="mr-1.5">{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Link
            key={m.id}
            to="/item/$id"
            params={{ id: m.id }}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={m.image}
                alt={m.name}
                className="size-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
              {m.isFeatured && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                  Featured
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight">{m.name}</h3>
                <span className="shrink-0 text-base font-bold text-primary">Ksh {m.price.toFixed(2)}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{m.prepTime} min · {m.calories} cal</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Plus className="size-3" /> Add
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">No items match your search.</p>
      )}
    </main>
  );
}
