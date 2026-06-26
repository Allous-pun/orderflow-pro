import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Users, CheckCircle2, CreditCard } from "lucide-react";
import { useStore, orders, notifications } from "@/lib/store";
import { staff } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Order, PaymentMethod } from "@/types";

export const Route = createFileRoute("/waiter")({
  head: () => ({ meta: [{ title: "Waiter App — RestaurantFlow" }] }),
  component: WaiterApp,
});

function WaiterApp() {
  const waiters = staff.filter((s) => s.role === "waiter");
  const [waiterId, setWaiterId] = useState(waiters[0].id);
  const allOrders = useStore((s) => s.orders);
  const notes = useStore((s) => s.notifications.filter((n) => n.userId === waiterId));

  const mine = allOrders.filter(
    (o) => o.waiterId === waiterId && o.status !== "completed" && o.status !== "cancelled",
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Users className="size-6 text-primary" /> Waiter Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Your assigned tables & order pickups.</p>
        </div>
        <div className="flex gap-2">
          {waiters.map((w) => {
            const cnt = allOrders.filter((o) => o.waiterId === w.id && ["pending", "confirmed", "preparing", "ready"].includes(o.status)).length;
            return (
              <button
                key={w.id}
                onClick={() => setWaiterId(w.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                  waiterId === w.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {w.name} <span className="ml-1 text-xs opacity-70">({cnt})</span>
              </button>
            );
          })}
        </div>
      </header>

      {notes.filter((n) => !n.read).length > 0 && (
        <section className="mt-5 rounded-2xl border border-primary/40 bg-primary/5 p-4">
          <header className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-primary">
              <Bell className="size-4" /> Notifications ({notes.filter((n) => !n.read).length})
            </p>
            <button onClick={() => notifications.markAllRead(waiterId)} className="text-xs font-semibold text-primary underline">
              Mark all read
            </button>
          </header>
          <ul className="mt-3 space-y-2">
            {notes.filter((n) => !n.read).slice(0, 4).map((n) => (
              <li key={n.id} className="rounded-xl bg-card p-3 text-sm">
                <p className="font-semibold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {mine.length === 0 && (
          <p className="col-span-2 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No active orders. New ones will appear here when assigned.
          </p>
        )}
        {mine.map((o) => (
          <WaiterCard key={o.id} order={o} />
        ))}
      </div>
    </main>
  );
}

function WaiterCard({ order }: { order: Order }) {
  const [paying, setPaying] = useState(false);
  const allReady = order.items.every((i) => i.status === "ready");

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{order.orderNumber}</p>
          <p className="text-xl font-bold">Table {order.tableNumber ?? "Takeaway"}</p>
          {order.customerName && <p className="text-xs text-muted-foreground">For {order.customerName}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold capitalize",
            order.status === "ready" ? "bg-success text-success-foreground" :
            order.status === "preparing" ? "bg-info text-info-foreground" :
            order.status === "delivered" ? "bg-secondary text-secondary-foreground" :
            "bg-warning text-warning-foreground",
          )}>{order.status}</span>
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold",
            order.paymentStatus === "paid" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground",
          )}>{order.paymentStatus === "paid" ? "Paid" : "Pay later"}</span>
        </div>
      </header>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((i) => (
          <li key={i.cartId} className="flex justify-between">
            <span>{i.quantity}× {i.name}</span>
            <span className="text-xs uppercase text-muted-foreground">{i.status}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm font-bold">Total ${order.total.toFixed(2)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {allReady && order.status === "ready" && (
          <button
            onClick={() => orders.setStatus(order.id, "delivered")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <CheckCircle2 className="size-4" /> Mark delivered
          </button>
        )}
        {order.status === "delivered" && order.paymentStatus === "pending" && !paying && (
          <button
            onClick={() => setPaying(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground"
          >
            <CreditCard className="size-4" /> Collect payment
          </button>
        )}
        {order.status === "delivered" && order.paymentStatus === "paid" && (
          <button
            onClick={() => orders.setStatus(order.id, "completed")}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold"
          >
            Close out table
          </button>
        )}
      </div>

      {paying && (
        <div className="mt-3 rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-xs font-semibold">Choose method</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["mpesa", "card", "cash", "wallet"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  orders.collectPayment(order.id, m);
                  setPaying(false);
                }}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
