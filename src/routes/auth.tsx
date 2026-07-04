import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, UserPlus, ChefHat, Users, LayoutDashboard, Shield, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockUsers,
  saveSession,
  roleHome,
  type MockRole,
} from "@/lib/mock-users";
import { session as roleSession } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RestaurantFlow" },
      { name: "description", content: "Sign in or create an account to access your RestaurantFlow dashboard." },
    ],
  }),
  component: AuthPage,
});

const roleMeta: Record<MockRole, { label: string; icon: typeof Users; color: string }> = {
  waiter: { label: "Waiter", icon: Users, color: "from-sky-500 to-blue-600" },
  kitchen: { label: "Kitchen", icon: ChefHat, color: "from-orange-500 to-red-600" },
  manager: { label: "Manager", icon: LayoutDashboard, color: "from-emerald-500 to-teal-600" },
  admin: { label: "Admin", icon: Shield, color: "from-purple-500 to-fuchsia-600" },
};

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<MockRole>("waiter");

  function completeLogin(user: {
    id: string;
    name: string;
    email: string;
    role: MockRole;
  }) {
    saveSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
    if (user.role !== "admin") {
      roleSession.setRole(user.role);
    }
    toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
    navigate({ to: roleHome(user.role) });
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword,
    );
    if (!user) {
      toast.error("Invalid credentials. Try the demo accounts below.");
      return;
    }
    completeLogin(user);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || password.length < 6) {
      toast.error("Please fill all fields (password 6+ chars).");
      return;
    }
    completeLogin({ id: `u_${Date.now()}`, name, email, role });
  }

  function quickLogin(r: MockRole) {
    const u = mockUsers.find((x) => x.role === r)!;
    setLoginEmail(u.email);
    setLoginPassword(u.password);
    completeLogin(u);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-muted/30 py-10 px-4">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: brand + demo accounts */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div
              className="grid size-12 place-items-center rounded-2xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Utensils className="size-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">RestaurantFlow</div>
              <div className="text-sm text-muted-foreground">One login. Every station.</div>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pick a demo account to jump straight into a role — or use the form to sign up as a new
            teammate.
          </p>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Demo accounts
            </div>
            {(Object.keys(roleMeta) as MockRole[]).map((r) => {
              const u = mockUsers.find((x) => x.role === r)!;
              const meta = roleMeta[r];
              const Icon = meta.icon;
              return (
                <button
                  key={r}
                  onClick={() => quickLogin(r)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:shadow-md"
                >
                  <div
                    className={cn(
                      "grid size-10 place-items-center rounded-lg bg-gradient-to-br text-white",
                      meta.color,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{u.name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {u.email} · {u.password}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                    Sign in →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: auth card */}
        <Card className="border-border/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <LogIn className="mr-2 size-4" /> Log in
                </TabsTrigger>
                <TabsTrigger value="signup">
                  <UserPlus className="mr-2 size-4" /> Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@restaurant.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => toast.info("Contact your manager to reset your password.")}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <LogIn className="mr-2 size-4" /> Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Jane Waweru"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@restaurant.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(roleMeta) as MockRole[]).map((r) => {
                        const meta = roleMeta[r];
                        const Icon = meta.icon;
                        const active = role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition",
                              active
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border text-muted-foreground hover:border-primary/40",
                            )}
                          >
                            <Icon className="size-4" />
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <UserPlus className="mr-2 size-4" /> Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
