import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChefHat, Clock, Volume2, VolumeX } from "lucide-react";
import { useStore, orders } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

export const Route = createFileRoute("/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen Display — RestaurantFlow" }] }),
  component: KitchenView,
});

const STATIONS = ["All", "Grill", "Salad", "Beverage", "Dessert"] as const;

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.45);
  } catch {}
}

function KitchenView() {
  const allOrders = useStore((s) => s.orders);
  const [station, setStation] = useState<(typeof STATIONS)[number]>("All");
  const [sound, setSound] = useState(true);
  const prevIds = useRef<Set<string>>(new Set());

  const active = useMemo(
    () => allOrders.filter((o) => ["pending", "confirmed", "preparing", "ready"].includes(o.status)),
    [allOrders],
  );

  useEffect(() => {
    const ids = new Set(active.map((o) => o.id));
    const newly = [...ids].filter((id) => !prevIds.current.has(id));
    if (prevIds.current.size > 0 && newly.length > 0 && sound) beep();
    prevIds.current = ids;
  }, [active, sound]);

  const filtered = (o: Order) =>
    station === "All" || o.items.some((i) => i.station === station);

  const cols: { key: "incoming" | "preparing" | "ready"; label: string; tone: string }[] = [
    { key: "incoming", label: "Incoming", tone: "bg-warning/15 border-warning/40 text-warning-foreground" },
    { key: "preparing", label: "Preparing", tone: "bg-info/10 border-info/40 text-info" },
    { key: "ready", label: "Ready for pickup", tone: "bg-success/10 border-success/40 text-success" },
  ];

  const bucket = (o: Order) => {
    if (o.status === "ready") return "ready";
    if (o.status === "preparing") return "preparing";
    return "incoming";
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ChefHat className="size-6 text-primary" /> Kitchen Display
          </h1>
          <p className="text-sm text-muted-foreground">Live orders, station view, sound alerts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStation(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                station === s ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setSound((s) => !s)}
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            {sound ? "Sound on" : "Muted"}
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {cols.map((c) => {
          const list = active.filter((o) => bucket(o) === c.key).filter(filtered);
          return (
            <section key={c.key}>
              <h2 className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider", c.tone)}>
                {c.label} <span className="opacity-70">{list.length}</span>
              </h2>
              <div className="mt-3 space-y-3">
                {list.map((o) => (
                  <KitchenCard key={o.id} order={o} station={station} />
                ))}
                {list.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Empty</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function KitchenCard({ order, station }: { order: Order; station: string }) {
  const visible = station === "All" ? order.items : order.items.filter((i) => i.station === station);
  const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const allReady = order.items.every((i) => i.status === "ready");

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm transition",
        order.status === "pending" ? "border-warning/60 animate-[pulseRing_1.5s_ease-out_infinite]" : "border-border",
      )}
    >
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{order.orderNumber}</p>
          <p className="text-lg font-bold">Table {order.tableNumber ?? "Takeaway"}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold">
          <Clock className="size-3" /> {mins}m
        </span>
      </header>

      <ul className="mt-3 space-y-2">
        {visible.map((i) => (
          <li key={i.cartId} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{i.quantity}× {i.name}</p>
                {i.modifiers.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{i.modifiers.map((m) => m.name).join(" · ")}</p>
                )}
                {i.notes && <p className="mt-0.5 text-xs italic text-primary">Note: {i.notes}</p>}
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{i.station}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {i.status !== "ready" && i.status !== "delivered" && (
                  <>
                    {i.status === "pending" && (
                      <button
                        onClick={() => orders.setItemStatus(order.id, i.cartId, "preparing")}
                        className="rounded-full bg-info px-3 py-1 text-xs font-bold text-info-foreground"
                      >
                        Start
                      </button>
                    )}
                    {i.status === "preparing" && (
                      <button
                        onClick={() => orders.setItemStatus(order.id, i.cartId, "ready")}
                        className="rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground"
                      >
                        Ready
                      </button>
                    )}
                  </>
                )}
                {i.status === "ready" && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">Ready</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {allReady && order.status === "ready" && (
        <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-success">
          🔔 Notify {order.waiterName} for pickup
        </p>
      )}
    </article>
  );
}
