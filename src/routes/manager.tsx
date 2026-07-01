import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { TrendingUp, ShoppingBag, Users, Clock, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { useStore } from "@/lib/store";
import { menuItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/manager")({
  head: () => ({ meta: [{ title: "Manager Dashboard — RestaurantFlow" }] }),
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const allOrders = useStore((s) => s.orders);

  const stats = useMemo(() => {
    const revenue = allOrders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
    const active = allOrders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
    const completed = allOrders.filter((o) => o.status === "completed").length;
    const avg = allOrders.length ? allOrders.reduce((s, o) => s + o.total, 0) / allOrders.length : 0;
    return { revenue, active, completed, avg, total: allOrders.length };
  }, [allOrders]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    allOrders.forEach((o) => (map[o.status] = (map[o.status] ?? 0) + 1));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allOrders]);

  const topItems = useMemo(() => {
    const counts: Record<string, number> = {};
    allOrders.forEach((o) => o.items.forEach((i) => (counts[i.name] = (counts[i.name] ?? 0) + i.quantity)));
    return Object.entries(counts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [allOrders]);

  const revenueSeries = useMemo(() => {
    const days: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { weekday: "short" });
      const total = allOrders
        .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString() && o.paymentStatus === "paid")
        .reduce((s, o) => s + o.total, 0);
      days.push({ day: key, revenue: Math.round(total) });
    }
    return days;
  }, [allOrders]);

  const COLORS = ["oklch(0.68 0.19 38)", "oklch(0.72 0.13 240)", "oklch(0.7 0.16 145)", "oklch(0.8 0.15 70)", "oklch(0.55 0.18 300)"];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
      <p className="text-sm text-muted-foreground">Live performance across orders, kitchen, and revenue.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Revenue (paid)" value={`Ksh ${stats.revenue.toFixed(2)}`} icon={DollarSign} tone="primary" />
        <KPI label="Active orders" value={stats.active} icon={ShoppingBag} tone="info" />
        <KPI label="Completed today" value={stats.completed} icon={Users} tone="success" />
        <KPI label="Avg check" value={`Ksh ${stats.avg.toFixed(2)}`} icon={TrendingUp} tone="warning" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel title="Revenue · last 7 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Order status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-1 grid grid-cols-2 gap-1 text-xs">
            {statusData.map((s, i) => (
              <li key={s.name} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="capitalize text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-bold">{s.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Top selling items">
          {topItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet — place a test order from the menu.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="name" width={130} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="qty" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Recent orders">
          <ul className="divide-y divide-border">
            {allOrders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Table {o.tableNumber ?? "—"} · {o.waiterName} · {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">${o.total.toFixed(2)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{o.status}</p>
                </div>
              </li>
            ))}
            {allOrders.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">No orders yet.</li>
            )}
          </ul>
        </Panel>
      </div>

      <Panel title="Menu inventory · quick view" className="mt-6">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.slice(0, 6).map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <img src={m.image} alt="" className="size-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">${m.price.toFixed(2)} · {m.station}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", m.isAvailable ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                {m.isAvailable ? "Available" : "Off"}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}

function KPI({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon: typeof Clock; tone: "primary" | "info" | "success" | "warning" }) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn("grid size-9 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
