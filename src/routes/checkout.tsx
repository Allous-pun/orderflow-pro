import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Smartphone, Banknote, Wallet, ArrowLeft } from "lucide-react";
import { cart, useStore, cartTotals, orders } from "@/lib/store";
import { tables } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { OrderType, PaymentMethod } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — RestaurantFlow" }] }),
  component: Checkout,
});

const methods = [
  { id: "mpesa", label: "M-Pesa", Icon: Smartphone },
  { id: "card", label: "Card", Icon: CreditCard },
  { id: "cash", label: "Cash", Icon: Banknote },
  { id: "wallet", label: "Wallet", Icon: Wallet },
] as const;

function Checkout() {
  const navigate = useNavigate();
  const items = useStore((s) => s.cart);
  const { subtotal, tax, total } = cartTotals(items);
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [tableNumber, setTableNumber] = useState(tables[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [timing, setTiming] = useState<"pay-now" | "pay-later">("pay-now");
  const [method, setMethod] = useState<PaymentMethod>("mpesa");

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/menu" className="mt-4 inline-block text-primary underline">Browse menu</Link>
      </main>
    );
  }

  const place = () => {
    const order = orders.create({
      cartItems: items,
      customerName: name || undefined,
      customerPhone: phone || undefined,
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
      orderType,
      paymentTiming: timing,
      paymentMethod: timing === "pay-now" ? method : undefined,
    });
    cart.clear();
    navigate({ to: "/order-confirmation/$id", params: { id: order.id } });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to cart
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Order type</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["dine-in", "takeaway"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition",
                    orderType === t ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t === "dine-in" ? "Dine-in" : "Takeaway"}
                </button>
              ))}
            </div>
            {orderType === "dine-in" && (
              <div className="mt-4">
                <label className="text-sm font-semibold">Table number</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tables.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTableNumber(t)}
                      className={cn(
                        "min-w-12 rounded-lg border px-3 py-2 text-sm font-bold transition",
                        tableNumber === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Your info <span className="text-xs font-normal text-muted-foreground">(optional, for loyalty points)</span></h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">When do you want to pay?</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["pay-now", "pay-later"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTiming(t)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                    timing === t ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t === "pay-now" ? "Pay now" : "Pay later"}
                </button>
              ))}
            </div>
            {timing === "pay-now" && (
              <div className="mt-4">
                <p className="text-sm font-semibold">Payment method</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {methods.map((m) => {
                    const Icon = m.Icon;
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition",
                          active ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="size-5" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Review</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.cartId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{i.quantity}× {i.name}</span>
                <span>Ksh {(i.unitPrice * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>Ksh {subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>Ksh {tax.toFixed(2)}</dd></div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt><dd className="text-primary">Ksh {total.toFixed(2)}</dd>
            </div>
          </dl>
          <button
            onClick={place}
            className="mt-5 w-full rounded-full bg-primary py-3 font-bold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            Place order
          </button>
        </aside>
      </div>
    </main>
  );
}
