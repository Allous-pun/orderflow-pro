import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChefHat, Bell, Truck, Receipt as RIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const Route = createFileRoute("/order-tracking/$id")({
  head: ({ params }) => ({ meta: [{ title: `Tracking ${params.id}` }] }),
  component: Tracking,
  notFoundComponent: () => <main className="mx-auto max-w-3xl px-4 py-20 text-center">Order not found.</main>,
});

const steps: { id: OrderStatus; label: string; Icon: typeof Check }[] = [
  { id: "confirmed", label: "Confirmed", Icon: RIcon },
  { id: "preparing", label: "Preparing", Icon: ChefHat },
  { id: "ready", label: "Ready", Icon: Bell },
  { id: "delivered", label: "Delivered", Icon: Truck },
  { id: "completed", label: "Completed", Icon: Check },
];

const order_index = (s: OrderStatus) => {
  const order: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered", "completed"];
  return order.indexOf(s);
};

function Tracking() {
  const id = Route.useParams().id;
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  if (!order) throw notFound();

  const currentIdx = order_index(order.status);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/menu" className="text-sm text-muted-foreground hover:text-foreground">← Menu</Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Tracking your order</h1>
      <p className="mt-1 text-muted-foreground">
        {order.orderNumber} · Table {order.tableNumber ?? "—"} · Waiter {order.waiterName}
      </p>

      <ol className="mt-8 space-y-4">
        {steps.map((s, i) => {
          const done = currentIdx >= order_index(s.id);
          const active = currentIdx === order_index(s.id);
          const Icon = s.Icon;
          return (
            <li key={s.id} className="flex items-center gap-4">
              <div
                className={cn(
                  "grid size-11 place-items-center rounded-full border-2",
                  done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                  active && "animate-[pulseRing_1.5s_ease-out_infinite]",
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className={cn("font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
                {active && <p className="text-xs text-primary">In progress…</p>}
              </div>
              {done && <Check className="size-5 text-success" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.cartId} className="flex justify-between gap-2">
              <span>
                <span className="font-medium">{i.quantity}× {i.name}</span>
                <span className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                  i.status === "ready" ? "bg-success/15 text-success" :
                  i.status === "preparing" ? "bg-warning/20 text-warning-foreground" :
                  i.status === "delivered" ? "bg-info/15 text-info" :
                  "bg-muted text-muted-foreground",
                )}>{i.status}</span>
              </span>
              <span>Ksh {(i.unitPrice * i.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
