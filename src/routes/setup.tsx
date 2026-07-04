import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  MapPin,
  Utensils,
  CreditCard,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Store,
  Clock,
  Percent,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Setup — RestaurantFlow" },
      { name: "description", content: "Get your restaurant up and running in minutes." },
      { property: "og:title", content: "Setup — RestaurantFlow" },
      { property: "og:description", content: "Configure your restaurant in a guided wizard." },
    ],
  }),
  component: SetupPage,
});

type StepId = "restaurant" | "location" | "menu" | "payments" | "preferences" | "review";

const steps: { id: StepId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "restaurant", label: "Restaurant", icon: Building2 },
  { id: "location", label: "Location", icon: MapPin },
  { id: "menu", label: "Menu", icon: Utensils },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Sparkles },
  { id: "review", label: "Review", icon: Check },
];

type FormState = {
  restaurantName: string;
  cuisine: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  tables: number;
  openTime: string;
  closeTime: string;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  categories: string[];
  paymentMethods: { mpesa: boolean; card: boolean; cash: boolean; wallet: boolean };
  mpesaShortcode: string;
  features: { loyalty: boolean; aiMenu: boolean; kds: boolean; sms: boolean };
};

const defaults: FormState = {
  restaurantName: "",
  cuisine: "African",
  ownerName: "",
  ownerEmail: "",
  phone: "",
  address: "",
  city: "Nairobi",
  country: "Kenya",
  timezone: "Africa/Nairobi",
  tables: 12,
  openTime: "08:00",
  closeTime: "22:00",
  currency: "KES",
  taxRate: 16,
  serviceCharge: 10,
  categories: ["Starters", "Mains", "Drinks", "Desserts"],
  paymentMethods: { mpesa: true, card: true, cash: true, wallet: false },
  mpesaShortcode: "",
  features: { loyalty: true, aiMenu: false, kds: true, sms: true },
};

function SetupPage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(defaults);
  const [newCategory, setNewCategory] = useState("");

  const step = steps[stepIndex];
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const next = () => setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const finish = () => {
    try {
      localStorage.setItem("rf_setup", JSON.stringify(form));
    } catch {}
    toast.success(`${form.restaurantName || "Your restaurant"} is ready to go!`);
    navigate({ to: "/admin" });
  };

  const canProceed = (() => {
    switch (step.id) {
      case "restaurant":
        return form.restaurantName.trim() && form.ownerName.trim() && form.ownerEmail.trim();
      case "location":
        return form.address.trim() && form.city.trim();
      case "menu":
        return form.categories.length > 0;
      case "payments":
        return Object.values(form.paymentMethods).some(Boolean);
      default:
        return true;
    }
  })();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> Guided setup
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Set up your restaurant
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              A few quick steps to launch orders, payments and the kitchen display.
            </p>
          </div>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Skip for now
          </Link>
        </div>

        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3 text-sm transition",
                  active
                    ? "border-primary bg-primary/5 text-foreground"
                    : done
                      ? "border-primary/40 bg-background text-foreground"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Step {i + 1}
                  </div>
                  <div className="font-semibold leading-tight">{s.label}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <Card className="p-6 sm:p-8">
          {step.id === "restaurant" && (
            <div className="grid gap-5">
              <SectionTitle icon={Store} title="Tell us about your restaurant" />
              <Field label="Restaurant name">
                <Input
                  value={form.restaurantName}
                  onChange={(e) => update("restaurantName", e.target.value)}
                  placeholder="e.g. Mama Ashanti Kitchen"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Cuisine">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    value={form.cuisine}
                    onChange={(e) => update("cuisine", e.target.value)}
                  >
                    {["African", "Fast food", "Cafe", "Fine dining", "Pizzeria", "Bar & Grill"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      ),
                    )}
                  </select>
                </Field>
                <Field label="Owner phone">
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+254 700 000 000"
                  />
                </Field>
                <Field label="Owner name">
                  <Input
                    value={form.ownerName}
                    onChange={(e) => update("ownerName", e.target.value)}
                    placeholder="Jane Wanjiku"
                  />
                </Field>
                <Field label="Owner email">
                  <Input
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => update("ownerEmail", e.target.value)}
                    placeholder="owner@restaurant.co.ke"
                  />
                </Field>
              </div>
            </div>
          )}

          {step.id === "location" && (
            <div className="grid gap-5">
              <SectionTitle icon={MapPin} title="Where are you located?" />
              <Field label="Street address">
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Kimathi Street, Building 4"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="City">
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
                </Field>
                <Field label="Country">
                  <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
                </Field>
                <Field label="Timezone">
                  <Input
                    value={form.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Tables">
                  <Input
                    type="number"
                    min={0}
                    value={form.tables}
                    onChange={(e) => update("tables", Number(e.target.value))}
                  />
                </Field>
                <Field label="Opens at">
                  <Input
                    type="time"
                    value={form.openTime}
                    onChange={(e) => update("openTime", e.target.value)}
                  />
                </Field>
                <Field label="Closes at">
                  <Input
                    type="time"
                    value={form.closeTime}
                    onChange={(e) => update("closeTime", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step.id === "menu" && (
            <div className="grid gap-5">
              <SectionTitle icon={Utensils} title="Set up your menu structure" />
              <p className="text-sm text-muted-foreground">
                Add the categories you'll organize dishes under. You can edit them later.
              </p>
              <div className="flex flex-wrap gap-2">
                {form.categories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-sm"
                  >
                    {c}
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        update(
                          "categories",
                          form.categories.filter((x) => x !== c),
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category (e.g. Sides)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCategory.trim()) {
                      update("categories", [...form.categories, newCategory.trim()]);
                      setNewCategory("");
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!newCategory.trim()) return;
                    update("categories", [...form.categories, newCategory.trim()]);
                    setNewCategory("");
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Tax rate (%)">
                  <Input
                    type="number"
                    value={form.taxRate}
                    onChange={(e) => update("taxRate", Number(e.target.value))}
                  />
                </Field>
                <Field label="Service charge (%)">
                  <Input
                    type="number"
                    value={form.serviceCharge}
                    onChange={(e) => update("serviceCharge", Number(e.target.value))}
                  />
                </Field>
              </div>
            </div>
          )}

          {step.id === "payments" && (
            <div className="grid gap-5">
              <SectionTitle icon={CreditCard} title="How will customers pay?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { key: "mpesa", label: "M-Pesa", hint: "Daraja STK Push" },
                    { key: "card", label: "Card", hint: "Visa / Mastercard" },
                    { key: "cash", label: "Cash", hint: "At the counter" },
                    { key: "wallet", label: "Wallet", hint: "In-app balance" },
                  ] as const
                ).map((m) => {
                  const active = form.paymentMethods[m.key];
                  return (
                    <button
                      key={m.key}
                      onClick={() =>
                        update("paymentMethods", {
                          ...form.paymentMethods,
                          [m.key]: !active,
                        })
                      }
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 text-left transition",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <div>
                        <div className="font-semibold">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.hint}</div>
                      </div>
                      <div
                        className={cn(
                          "grid size-6 place-items-center rounded-full border",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {active && <Check className="size-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {form.paymentMethods.mpesa && (
                <Field label="M-Pesa Paybill / Till number">
                  <Input
                    value={form.mpesaShortcode}
                    onChange={(e) => update("mpesaShortcode", e.target.value)}
                    placeholder="e.g. 174379"
                  />
                </Field>
              )}
              <Field label="Currency">
                <Input value={form.currency} onChange={(e) => update("currency", e.target.value)} />
              </Field>
            </div>
          )}

          {step.id === "preferences" && (
            <div className="grid gap-5">
              <SectionTitle icon={Sparkles} title="Turn on the features you need" />
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { key: "loyalty", label: "Loyalty rewards", icon: Sparkles },
                    { key: "aiMenu", label: "AI menu suggestions", icon: Sparkles },
                    { key: "kds", label: "Kitchen display (KDS)", icon: Clock },
                    { key: "sms", label: "SMS notifications", icon: Bell },
                  ] as const
                ).map((f) => {
                  const Icon = f.icon;
                  const active = form.features[f.key];
                  return (
                    <label
                      key={f.key}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-4",
                        active ? "border-primary bg-primary/5" : "border-border",
                      )}
                    >
                      <span className="inline-flex items-center gap-3">
                        <Icon className="size-4 text-primary" />
                        <span className="font-medium">{f.label}</span>
                      </span>
                      <input
                        type="checkbox"
                        className="size-4 accent-[color:var(--primary)]"
                        checked={active}
                        onChange={() =>
                          update("features", { ...form.features, [f.key]: !active })
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step.id === "review" && (
            <div className="grid gap-5">
              <SectionTitle icon={Check} title="Review and launch" />
              <div className="grid gap-4 sm:grid-cols-2">
                <ReviewBlock title="Restaurant">
                  <ReviewRow label="Name" value={form.restaurantName || "—"} />
                  <ReviewRow label="Cuisine" value={form.cuisine} />
                  <ReviewRow label="Owner" value={form.ownerName || "—"} />
                  <ReviewRow label="Email" value={form.ownerEmail || "—"} />
                </ReviewBlock>
                <ReviewBlock title="Location & hours">
                  <ReviewRow label="Address" value={`${form.address}, ${form.city}`} />
                  <ReviewRow label="Country" value={form.country} />
                  <ReviewRow label="Hours" value={`${form.openTime} – ${form.closeTime}`} />
                  <ReviewRow label="Tables" value={String(form.tables)} />
                </ReviewBlock>
                <ReviewBlock title="Menu & taxes">
                  <ReviewRow
                    label="Categories"
                    value={form.categories.join(", ") || "—"}
                  />
                  <ReviewRow label="Tax" value={`${form.taxRate}%`} />
                  <ReviewRow label="Service charge" value={`${form.serviceCharge}%`} />
                </ReviewBlock>
                <ReviewBlock title="Payments & features">
                  <ReviewRow
                    label="Methods"
                    value={
                      Object.entries(form.paymentMethods)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(", ") || "—"
                    }
                  />
                  <ReviewRow label="Currency" value={form.currency} />
                  <ReviewRow
                    label="Features"
                    value={
                      Object.entries(form.features)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(", ") || "—"
                    }
                  />
                </ReviewBlock>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button variant="ghost" onClick={back} disabled={stepIndex === 0}>
              <ChevronLeft className="size-4" /> Back
            </Button>
            <div className="text-xs text-muted-foreground">
              Step {stepIndex + 1} of {steps.length}
            </div>
            {stepIndex < steps.length - 1 ? (
              <Button onClick={next} disabled={!canProceed}>
                Next <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={finish}>
                Finish setup <Check className="size-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Percent className="size-3.5 text-primary" /> {title}
      </div>
      <dl className="grid gap-1 text-sm">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
