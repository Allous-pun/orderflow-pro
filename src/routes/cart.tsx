import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { cart, useStore, cartTotals } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — RestaurantFlow" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useStore((s) => s.cart);
  const { subtotal, tax, total } = cartTotals(items);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Pick something from the menu to get started.</p>
        <Link to="/menu" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Browse menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.cartId} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{it.name}</h3>
                  <span className="text-sm font-bold">Ksh {(it.unitPrice * it.quantity).toFixed(2)}</span>
                </div>
                {it.modifiers.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {it.modifiers.map((m) => (
                      <span key={m.optionId} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
                {it.notes && <p className="mt-1.5 text-xs text-muted-foreground">Note: {it.notes}</p>}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background p-0.5">
                    <button onClick={() => cart.updateQty(it.cartId, it.quantity - 1)} className="grid size-7 place-items-center rounded-full hover:bg-muted">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{it.quantity}</span>
                    <button onClick={() => cart.updateQty(it.cartId, it.quantity + 1)} className="grid size-7 place-items-center rounded-full hover:bg-muted">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button onClick={() => cart.remove(it.cartId)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-destructive">
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>Ksh {subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax (8%)</dt><dd>Ksh {tax.toFixed(2)}</dd></div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt><dd className="text-primary">Ksh {total.toFixed(2)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="mt-5 block w-full rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground shadow-glow">
            Checkout
          </Link>
          <Link to="/menu" className="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
