import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Shield, Building2, Users, KeyRound, Settings, CreditCard, Lock, FileText, BarChart3,
  Plus, Trash2, Check, X, Search, Globe, Server, ShieldCheck, Activity, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "System Admin — RestaurantFlow" }] }),
  component: AdminDashboard,
});

// ── Mock data ────────────────────────────────────────────────────────
type Restaurant = { id: string; name: string; city: string; status: "active" | "suspended"; plan: "Starter" | "Pro" | "Enterprise"; orders: number; revenue: number };
type AdminUser = { id: string; name: string; email: string; role: string; restaurant: string; status: "active" | "disabled"; lastLogin: string };
type RoleDef = { id: string; name: string; permissions: string[] };
type AuditLog = { id: string; ts: string; actor: string; action: string; target: string; ip: string };

const initialRestaurants: Restaurant[] = [
  { id: "r1", name: "Nairobi Central", city: "Nairobi", status: "active", plan: "Enterprise", orders: 1284, revenue: 892400 },
  { id: "r2", name: "Westlands Grill", city: "Nairobi", status: "active", plan: "Pro", orders: 742, revenue: 431200 },
  { id: "r3", name: "Mombasa Beachside", city: "Mombasa", status: "active", plan: "Pro", orders: 613, revenue: 388900 },
  { id: "r4", name: "Kisumu Lakeview", city: "Kisumu", status: "suspended", plan: "Starter", orders: 128, revenue: 74300 },
  { id: "r5", name: "Nakuru Junction", city: "Nakuru", status: "active", plan: "Starter", orders: 302, revenue: 154800 },
];

const initialUsers: AdminUser[] = [
  { id: "u1", name: "Grace Wanjiku", email: "grace@rflow.co.ke", role: "System Admin", restaurant: "—", status: "active", lastLogin: "2m ago" },
  { id: "u2", name: "Peter Otieno", email: "peter@rflow.co.ke", role: "Restaurant Manager", restaurant: "Nairobi Central", status: "active", lastLogin: "12m ago" },
  { id: "u3", name: "Amina Yusuf", email: "amina@rflow.co.ke", role: "Waiter", restaurant: "Westlands Grill", status: "active", lastLogin: "1h ago" },
  { id: "u4", name: "John Mwangi", email: "john@rflow.co.ke", role: "Kitchen Staff", restaurant: "Mombasa Beachside", status: "active", lastLogin: "3h ago" },
  { id: "u5", name: "Fatuma Ali", email: "fatuma@rflow.co.ke", role: "Cashier", restaurant: "Nakuru Junction", status: "disabled", lastLogin: "5d ago" },
];

const ALL_PERMISSIONS = [
  "orders.view", "orders.manage", "menu.edit", "menu.view",
  "payments.collect", "payments.refund", "reports.view", "reports.export",
  "users.manage", "roles.manage", "settings.manage", "audit.view",
];

const initialRoles: RoleDef[] = [
  { id: "role_sa", name: "System Admin", permissions: [...ALL_PERMISSIONS] },
  { id: "role_rm", name: "Restaurant Manager", permissions: ["orders.view", "orders.manage", "menu.edit", "menu.view", "payments.collect", "payments.refund", "reports.view", "reports.export"] },
  { id: "role_ca", name: "Cashier", permissions: ["orders.view", "payments.collect", "payments.refund"] },
  { id: "role_wt", name: "Waiter", permissions: ["orders.view", "orders.manage", "payments.collect"] },
  { id: "role_ks", name: "Kitchen Staff", permissions: ["orders.view", "menu.view"] },
];

const initialAudit: AuditLog[] = [
  { id: "a1", ts: "2026-07-03 09:12", actor: "grace@rflow.co.ke", action: "user.create", target: "amina@rflow.co.ke", ip: "197.232.11.4" },
  { id: "a2", ts: "2026-07-03 08:47", actor: "peter@rflow.co.ke", action: "menu.update", target: "Item: Chicken Biryani", ip: "196.201.44.9" },
  { id: "a3", ts: "2026-07-03 08:03", actor: "grace@rflow.co.ke", action: "settings.update", target: "PaymentGateway: M-Pesa", ip: "197.232.11.4" },
  { id: "a4", ts: "2026-07-02 22:15", actor: "system", action: "auth.failed", target: "unknown@x.com", ip: "45.62.10.220" },
  { id: "a5", ts: "2026-07-02 19:41", actor: "fatuma@rflow.co.ke", action: "payment.refund", target: "ORD-20260702-014", ip: "196.201.13.2" },
  { id: "a6", ts: "2026-07-02 18:20", actor: "grace@rflow.co.ke", action: "role.update", target: "Role: Cashier", ip: "197.232.11.4" },
];

const revenueByRestaurant = initialRestaurants.map((r) => ({ name: r.name.split(" ")[0], revenue: r.revenue }));
const orderVolume = initialRestaurants.map((r) => ({ name: r.name.split(" ")[0], orders: r.orders }));
const userGrowth = [
  { m: "Jan", users: 120 }, { m: "Feb", users: 180 }, { m: "Mar", users: 260 },
  { m: "Apr", users: 340 }, { m: "May", users: 470 }, { m: "Jun", users: 612 }, { m: "Jul", users: 758 },
];
const restaurantGrowth = [
  { m: "Jan", r: 8 }, { m: "Feb", r: 12 }, { m: "Mar", r: 15 },
  { m: "Apr", r: 21 }, { m: "May", r: 28 }, { m: "Jun", r: 34 }, { m: "Jul", r: 42 },
];
const dau = [
  { d: "Mon", u: 412 }, { d: "Tue", u: 468 }, { d: "Wed", u: 521 },
  { d: "Thu", u: 498 }, { d: "Fri", u: 612 }, { d: "Sat", u: 704 }, { d: "Sun", u: 588 },
];
const paymentMix = [
  { name: "M-Pesa", value: 62 },
  { name: "Card", value: 21 },
  { name: "Cash", value: 12 },
  { name: "Wallet", value: 5 },
];
const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#6366f1"];

const fmt = (n: number) => `Ksh ${n.toLocaleString()}`;

function AdminDashboard() {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [audit] = useState(initialAudit);
  const [userSearch, setUserSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  const totals = useMemo(() => ({
    restaurants: restaurants.length,
    activeRestaurants: restaurants.filter((r) => r.status === "active").length,
    users: users.length,
    revenue: restaurants.reduce((s, r) => s + r.revenue, 0),
    orders: restaurants.reduce((s, r) => s + r.orders, 0),
  }), [restaurants, users]);

  const filteredUsers = users.filter((u) =>
    !userSearch || (u.name + u.email + u.role + u.restaurant).toLowerCase().includes(userSearch.toLowerCase()),
  );
  const filteredAudit = audit.filter((a) =>
    !auditSearch || (a.actor + a.action + a.target + a.ip).toLowerCase().includes(auditSearch.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <Shield className="size-3.5" /> System Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-muted-foreground">Global operations across every restaurant on the platform.</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3" /> Prod</Badge>
          <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600"><Activity className="size-3" /> Healthy</Badge>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard icon={Building2} label="Restaurants" value={totals.restaurants} sub={`${totals.activeRestaurants} active`} />
        <StatCard icon={Users} label="Users" value={totals.users} sub="all roles" />
        <StatCard icon={TrendingUp} label="Global Revenue" value={fmt(totals.revenue)} sub="lifetime" />
        <StatCard icon={BarChart3} label="Orders" value={totals.orders.toLocaleString()} sub="lifetime" />
        <StatCard icon={Server} label="Uptime" value="99.98%" sub="30d" />
      </div>

      <Tabs defaultValue="restaurants" className="w-full">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="restaurants"><Building2 className="mr-1.5 size-4" />Restaurants</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1.5 size-4" />Users</TabsTrigger>
          <TabsTrigger value="roles"><KeyRound className="mr-1.5 size-4" />Roles</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-1.5 size-4" />Settings</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="mr-1.5 size-4" />Payments</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-1.5 size-4" />Security</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="mr-1.5 size-4" />Audit</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="mr-1.5 size-4" />Reports</TabsTrigger>
        </TabsList>

        {/* RESTAURANTS */}
        <TabsContent value="restaurants">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Restaurant Management</CardTitle>
                <CardDescription>Create, suspend, or upgrade tenants on the platform.</CardDescription>
              </div>
              <Button onClick={() => {
                const id = `r${Date.now()}`;
                setRestaurants((rs) => [...rs, { id, name: "New Restaurant", city: "—", status: "active", plan: "Starter", orders: 0, revenue: 0 }]);
                toast.success("Restaurant added");
              }}>
                <Plus className="mr-1.5 size-4" /> Add Restaurant
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>City</TableHead><TableHead>Plan</TableHead>
                    <TableHead>Orders</TableHead><TableHead>Revenue</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell><Badge variant="secondary">{r.plan}</Badge></TableCell>
                      <TableCell>{r.orders.toLocaleString()}</TableCell>
                      <TableCell>{fmt(r.revenue)}</TableCell>
                      <TableCell>
                        {r.status === "active"
                          ? <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
                          : <Badge variant="destructive">Suspended</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setRestaurants((rs) => rs.map((x) => x.id === r.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x));
                          toast.success(`${r.name} ${r.status === "active" ? "suspended" : "activated"}`);
                        }}>{r.status === "active" ? "Suspend" : "Activate"}</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                          setRestaurants((rs) => rs.filter((x) => x.id !== r.id));
                          toast.success("Removed");
                        }}><Trash2 className="size-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All users across every restaurant.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input placeholder="Search users…" className="w-56 pl-8" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <Button onClick={() => {
                  const id = `u${Date.now()}`;
                  setUsers((us) => [{ id, name: "New User", email: "new@rflow.co.ke", role: "Waiter", restaurant: "—", status: "active", lastLogin: "just now" }, ...us]);
                  toast.success("User invited");
                }}><Plus className="mr-1.5 size-4" /> Invite</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                    <TableHead>Restaurant</TableHead><TableHead>Last Login</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell>{u.restaurant}</TableCell>
                      <TableCell className="text-muted-foreground">{u.lastLogin}</TableCell>
                      <TableCell>
                        {u.status === "active"
                          ? <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
                          : <Badge variant="secondary">Disabled</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setUsers((us) => us.map((x) => x.id === u.id ? { ...x, status: x.status === "active" ? "disabled" : "active" } : x));
                        }}>{u.status === "active" ? "Disable" : "Enable"}</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setUsers((us) => us.filter((x) => x.id !== u.id))}><Trash2 className="size-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role & Permission Management</CardTitle>
              <CardDescription>Fine-grained access control across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4 text-primary" />
                      <h3 className="font-semibold">{role.name}</h3>
                      <Badge variant="secondary">{role.permissions.length} perms</Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRoles((rs) => rs.filter((r) => r.id !== role.id))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {ALL_PERMISSIONS.map((p) => {
                      const on = role.permissions.includes(p);
                      return (
                        <label key={p} className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5 text-xs cursor-pointer">
                          <Checkbox checked={on} onCheckedChange={(v) => {
                            setRoles((rs) => rs.map((r) => r.id === role.id
                              ? { ...r, permissions: v ? [...r.permissions, p] : r.permissions.filter((x) => x !== p) }
                              : r));
                          }} />
                          <span className="font-mono">{p}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                setRoles((rs) => [...rs, { id: `role_${Date.now()}`, name: "New Role", permissions: [] }]);
              }}><Plus className="mr-1.5 size-4" /> Add Role</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="size-4" /> Global Settings</CardTitle>
                <CardDescription>Platform-wide branding and regional defaults.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="System Name"><Input defaultValue="RestaurantFlow" /></Field>
                <Field label="Default Currency">
                  <Select defaultValue="KES">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">Kenyan Shilling (Ksh)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Default Timezone">
                  <Select defaultValue="EAT">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EAT">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="CET">Europe/Berlin (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date Format">
                  <Select defaultValue="dmy">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Language">
                  <Select defaultValue="en">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Button onClick={() => toast.success("Global settings saved")}>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Feature Flags</CardTitle>
                <CardDescription>Enable capabilities per environment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle label="Loyalty Program" desc="Enable points & rewards" defaultOn />
                <Toggle label="Table Reservations" desc="Allow bookings from customer app" defaultOn />
                <Toggle label="Delivery Integration" desc="Uber Eats / Bolt Food" />
                <Toggle label="AI Menu Recommendations" desc="Personalized suggestions" defaultOn />
                <Toggle label="Multi-currency Checkout" desc="Show localized prices" />
                <Toggle label="Beta Kitchen Display" desc="New KDS UI" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments">
          <div className="grid gap-4 md:grid-cols-3">
            <GatewayCard name="M-Pesa (Daraja)" status="live" fields={["Consumer Key", "Consumer Secret", "Shortcode", "Passkey"]} />
            <GatewayCard name="Stripe" status="live" fields={["Publishable Key", "Secret Key", "Webhook Secret"]} />
            <GatewayCard name="Flutterwave" status="test" fields={["Public Key", "Secret Key", "Encryption Key"]} />
          </div>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Password Policy</CardTitle><CardDescription>Complexity requirements for all users.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <Field label="Minimum Length"><Input type="number" defaultValue={12} /></Field>
                <Toggle label="Require Uppercase" defaultOn />
                <Toggle label="Require Numbers" defaultOn />
                <Toggle label="Require Symbols" defaultOn />
                <Field label="Password Expiry (days)"><Input type="number" defaultValue={90} /></Field>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Session & Access</CardTitle><CardDescription>Auto-logout & network restrictions.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <Field label="Session Timeout (minutes)"><Input type="number" defaultValue={30} /></Field>
                <Field label="IP Whitelist (comma separated)"><Input placeholder="197.232.11.0/24, 41.90.0.0/16" /></Field>
                <Toggle label="Enforce 2FA (all admins)" defaultOn />
                <Toggle label="Enforce 2FA (all users)" />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>SSL Certificate</CardTitle><CardDescription>HTTPS is enforced on every request.</CardDescription></CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm md:grid-cols-4">
                  <Info label="Issuer" value="Let's Encrypt" />
                  <Info label="Domain" value="*.restaurantflow.app" />
                  <Info label="Expires" value="2026-11-14" />
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1"><Check className="size-3" /> Valid</Badge>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Renewal queued")}>Renew</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Audit Logs (Global)</CardTitle>
                <CardDescription>Every privileged action across the platform.</CardDescription>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input placeholder="Search logs…" className="w-64 pl-8" value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead>
                    <TableHead>Target</TableHead><TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudit.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.ts}</TableCell>
                      <TableCell>{a.actor}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{a.action}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{a.target}</TableCell>
                      <TableCell className="font-mono text-xs">{a.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Revenue by Restaurant" desc="Lifetime revenue comparison">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueByRestaurant}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Order Volume by Restaurant" desc="Orders processed">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={orderVolume}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="User Growth" desc="New users per month">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="m" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Restaurant Growth" desc="Cumulative tenants">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={restaurantGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="m" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="r" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Platform Usage (DAU)" desc="Daily active users this week">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dau}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="d" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="u" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Payment Method Usage" desc="Global breakdown">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={paymentMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={4}>
                    {paymentMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <Icon className="size-4 text-primary" />
        </div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function GatewayCard({ name, status, fields }: { name: string; status: "live" | "test"; fields: string[] }) {
  const [mode, setMode] = useState<"test" | "live">(status);
  const [connected, setConnected] = useState(true);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          {connected
            ? <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1"><Check className="size-3" />Connected</Badge>
            : <Badge variant="destructive" className="gap-1"><X className="size-3" />Down</Badge>}
        </div>
        <CardDescription>API keys & environment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((f) => (
          <Field key={f} label={f}><Input type="password" placeholder="••••••••••" /></Field>
        ))}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium">Environment</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={mode === "test" ? "font-bold text-primary" : "text-muted-foreground"}>Test</span>
            <Switch checked={mode === "live"} onCheckedChange={(v) => setMode(v ? "live" : "test")} />
            <span className={mode === "live" ? "font-bold text-primary" : "text-muted-foreground"}>Live</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => toast.success(`${name} saved`)}>Save</Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
            setConnected((c) => !c);
            toast.success(connected ? "Disconnected" : "Connection successful");
          }}>{connected ? "Disconnect" : "Test"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
