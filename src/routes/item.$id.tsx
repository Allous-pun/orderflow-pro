import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, ArrowLeft, Flame } from "lucide-react";
import { menuItems } from "@/lib/mock-data";
import { cart } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ModifierOption } from "@/types";

import type { MenuItem } from "@/types";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params }): { item: MenuItem } => {
    const item = menuItems.find((m) => m.id === params.id);
    if (!item) throw notFound();
    return { item };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-muted-foreground">Item not found.</p>
      <Link to="/menu" className="mt-4 inline-block text-primary underline">Back to menu</Link>
    </main>
  ),
  errorComponent: ({ reset }) => (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p>Something went wrong.</p>
      <button onClick={reset} className="mt-3 text-primary underline">Try again</button>
    </main>
  ),
  component: ItemDetail,
});

function ItemDetail() {
  const { item } = Route.useLoaderData();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of item.modifierGroups) {
      if (g.selectionType === "single" && g.options.length) init[g.id] = [g.options[0].id];
      else init[g.id] = [];
    }
    return init;
  });

  const chosenMods: ModifierOption[] = useMemo(() => {
    const out: ModifierOption[] = [];
    for (const g of item.modifierGroups) {
      const ids = selections[g.id] ?? [];
      for (const id of ids) {
        const opt = g.options.find((o) => o.id === id);
        if (opt) out.push(opt);
      }
    }
    return out;
  }, [item, selections]);

  const unit = item.price + chosenMods.reduce((s, m) => s + m.priceAdjustment, 0);
  const total = unit * qty;

  const toggle = (groupId: string, optionId: string, single: boolean) => {
    setSelections((s) => {
      const cur = s[groupId] ?? [];
      if (single) return { ...s, [groupId]: [optionId] };
      return { ...s, [groupId]: cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId] };
    });
  };

  const handleAdd = () => {
    cart.add(item, qty, chosenMods, notes || undefined);
    navigate({ to: "/cart" });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to menu
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-muted">
          <img src={item.image} alt={item.name} className="aspect-square w-full object-cover" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
          <p className="mt-2 text-muted-foreground">{item.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{item.calories} cal</span>
            <span>·</span>
            <span>{item.prepTime} min prep</span>
            {item.tags.includes("spicy") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">
                <Flame className="size-3" /> Spicy
              </span>
            )}
          </div>
          <p className="mt-4 text-3xl font-bold text-primary">${unit.toFixed(2)}</p>

          {item.modifierGroups.map((g) => (
            <div key={g.id} className="mt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">{g.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {g.selectionType === "single" ? "Pick one" : "Pick any"}
                  {g.required && " · Required"}
                </span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {g.options.map((o) => {
                  const checked = (selections[g.id] ?? []).includes(o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggle(g.id, o.id, g.selectionType === "single")}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition",
                        checked
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      <span className="font-medium">{o.name}</span>
                      <span className={cn("text-xs", checked ? "text-primary font-semibold" : "text-muted-foreground")}>
                        {o.priceAdjustment > 0 ? `+$${o.priceAdjustment.toFixed(2)}` : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-6">
            <label className="text-sm font-semibold">Special instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. no onions, extra sauce"
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-border bg-card p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-9 place-items-center rounded-full hover:bg-muted">
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-base font-bold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="grid size-9 place-items-center rounded-full hover:bg-muted">
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              Add to cart — ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
