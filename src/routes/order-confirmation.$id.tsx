import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Printer, MapPin, User, Clock, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Order } from "@/types";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.id} — Confirmed` }] }),
  component: Confirmation,
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p>Order not found.</p>
    </main>
  ),
});

function Confirmation() {
  const id = Route.useParams().id;
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  if (!order) throw notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-md">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 animate-[bounceIn_0.5s_ease-out]">
          <CheckCircle2 className="size-9 text-success" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Order confirmed!</h1>
        <p className="mt-1 text-muted-foreground">
          We've sent your order to the kitchen. {order.waiterName} will look after you.
        </p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order number</p>
        <p className="text-2xl font-bold text-primary">{order.orderNumber}</p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 text-sm">
          <Info icon={MapPin} label="Table" value={order.tableNumber ?? "Takeaway"} />
          <Info icon={User} label="Waiter" value={order.waiterName ?? "—"} />
          <Info icon={Clock} label="Ready in" value={`~${order.estimatedPrepTime} min`} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/order-tracking/$id"
            params={{ id: order.id }}
            className="rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground"
          >
            Track order
          </Link>
          <Link to="/menu" className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold">
            Order again
          </Link>
        </div>
      </div>

      <Link
        to="/loyalty"
        className="mt-6 flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-glow transition hover:opacity-95"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
          <Sparkles className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Loyalty bonus</p>
          <p className="text-lg font-bold">You earned +{order.loyaltyPointsEarned} points</p>
          <p className="text-xs text-white/80">Tap to view rewards catalog & redeem →</p>
        </div>
        <p className="text-3xl font-black tabular-nums">+{order.loyaltyPointsEarned}</p>
      </Link>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Receipt order={order} type="customer" />
        <Receipt order={order} type="cashier" />
      </div>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Icon className="mx-auto size-4 text-primary" />
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function Receipt({ order, type }: { order: Order; type: "customer" | "cashier" }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
          {type === "customer" ? "Customer Copy" : "Cashier Copy"}
        </span>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-sans text-[11px] font-semibold hover:bg-muted"
        >
          <Printer className="size-3" /> Print
        </button>
      </div>
      <div className="mt-4 text-center">
        <p className="text-base font-bold tracking-wider">RESTAURANTFLOW</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">123 Eat Street · Open daily</p>
      </div>
      <div className="mt-3 space-y-0.5 border-y border-dashed border-border py-2">
        <Row k="Order" v={order.orderNumber} />
        <Row k="Date" v={new Date(order.createdAt).toLocaleString()} />
        <Row k="Table" v={order.tableNumber ?? "Takeaway"} />
        <Row k="Waiter" v={order.waiterName ?? "—"} />
      </div>
      <div className="my-2 space-y-1.5">
        {order.items.map((i) => (
          <div key={i.cartId}>
            <Row k={`${i.quantity}x ${i.name}`} v={`Ksh ${(i.unitPrice * i.quantity).toFixed(2)}`} />
            {i.modifiers.map((m) => (
              <p key={m.optionId} className="pl-2 text-muted-foreground">+ {m.name}</p>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-border pt-2">
        <Row k="Subtotal" v={`Ksh ${order.subtotal.toFixed(2)}`} />
        <Row k="Tax" v={`Ksh ${order.tax.toFixed(2)}`} />
        <Row k="TOTAL" v={`Ksh ${order.total.toFixed(2)}`} bold />
      </div>
      <p className="mt-3 text-center text-[11px] font-semibold uppercase">
        Payment: {order.paymentStatus === "paid" ? `PAID (${order.paymentMethod})` : "PENDING"}
      </p>
      {type === "cashier" && (
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          Txn ref: {order.id} · ERP sync: pending
        </p>
      )}
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        {type === "customer"
          ? `+${order.loyaltyPointsEarned} loyalty pts earned · Thanks!`
          : "Cashier copy — keep for reconciliation"}
      </p>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "text-sm font-bold" : ""}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
