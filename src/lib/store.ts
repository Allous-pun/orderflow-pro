import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import type {
  CartItem,
  ModifierOption,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  Role,
  Notification,
} from "@/types";
import { staff as initialStaff } from "./mock-data";

const TAX_RATE = 0.08;
const STORAGE_KEY = "rf_state_v1";

interface State {
  cart: CartItem[];
  orders: Order[];
  notifications: Notification[];
  activeRole: Role;
  activeUserId: string;
  staff: typeof initialStaff;
}

function load(): State {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}
function defaults(): State {
  return {
    cart: [],
    orders: [],
    notifications: [],
    activeRole: "customer",
    activeUserId: "u_john",
    staff: initialStaff,
  };
}

let state: State = load();
const listeners = new Set<() => void>();

function setState(updater: (s: State) => State) {
  state = updater(state);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => state;
const getServerSnapshot = () => defaults();

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaults()),
  );
}

// ─── Cart ─────────────────────────────────────────────────────────────
export const cart = {
  add(item: MenuItem, quantity: number, mods: ModifierOption[], notes?: string) {
    const modSum = mods.reduce((s, m) => s + m.priceAdjustment, 0);
    const cartItem: CartItem = {
      cartId: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price + modSum,
      quantity,
      modifiers: mods.map((m) => ({ optionId: m.id, name: m.name, priceAdjustment: m.priceAdjustment })),
      notes,
      station: item.station,
    };
    setState((s) => ({ ...s, cart: [...s.cart, cartItem] }));
    toast.success(`${item.name} added to cart`);
  },
  remove(cartId: string) {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.cartId !== cartId) }));
  },
  updateQty(cartId: string, qty: number) {
    if (qty < 1) return;
    setState((s) => ({
      ...s,
      cart: s.cart.map((c) => (c.cartId === cartId ? { ...c, quantity: qty } : c)),
    }));
  },
  clear() {
    setState((s) => ({ ...s, cart: [] }));
  },
};

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

// ─── Orders ───────────────────────────────────────────────────────────
function nextOrderNumber(orders: Order[]) {
  const d = new Date();
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const todays = orders.filter((o) => o.orderNumber.includes(datePart)).length + 1;
  return `ORD-${datePart}-${String(todays).padStart(3, "0")}`;
}

function pickWaiter(orders: Order[]) {
  const waiters = initialStaff.filter((s) => s.role === "waiter");
  const counts = waiters.map((w) => ({
    waiter: w,
    n: orders.filter(
      (o) => o.waiterId === w.id && ["pending", "confirmed", "preparing", "ready"].includes(o.status),
    ).length,
  }));
  counts.sort((a, b) => a.n - b.n);
  return counts[0].waiter;
}

export const orders = {
  create(input: {
    cartItems: CartItem[];
    customerName?: string;
    customerPhone?: string;
    tableNumber?: string;
    orderType: OrderType;
    paymentTiming: "pay-now" | "pay-later";
    paymentMethod?: PaymentMethod;
    notes?: string;
  }): Order {
    const totals = cartTotals(input.cartItems);
    const waiter = pickWaiter(state.orders);
    const id = `o_${Date.now()}`;
    const order: Order = {
      id,
      orderNumber: nextOrderNumber(state.orders),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      tableNumber: input.tableNumber,
      orderType: input.orderType,
      status: input.paymentTiming === "pay-now" ? "confirmed" : "confirmed",
      paymentStatus: input.paymentTiming === "pay-now" ? "paid" : "pending",
      paymentMethod: input.paymentMethod,
      paymentTiming: input.paymentTiming,
      waiterId: waiter.id,
      waiterName: waiter.name,
      items: input.cartItems.map<OrderItem>((c) => ({ ...c, status: "pending" })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: 0,
      total: totals.total,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedPrepTime: Math.max(...input.cartItems.map((i) => 10), 10),
      loyaltyPointsEarned: Math.floor(totals.total),
    };
    setState((s) => ({
      ...s,
      orders: [order, ...s.orders],
      cart: [],
      notifications: [
        {
          id: `n_${Date.now()}`,
          userId: waiter.id,
          type: "order_assigned",
          title: "New order assigned",
          message: `${order.orderNumber} • Table ${order.tableNumber ?? "—"}`,
          orderId: order.id,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...s.notifications,
      ],
    }));
    return order;
  },
  get(id: string) {
    return state.orders.find((o) => o.id === id);
  },
  setStatus(id: string, status: OrderStatus) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o,
      ),
    }));
  },
  setItemStatus(orderId: string, cartId: string, itemStatus: OrderItem["status"]) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const items = o.items.map((it) => (it.cartId === cartId ? { ...it, status: itemStatus } : it));
        let status = o.status;
        if (items.every((i) => i.status === "ready")) status = "ready";
        else if (items.some((i) => i.status === "preparing")) status = "preparing";
        return { ...o, items, status, updatedAt: new Date().toISOString() };
      }),
    }));
    // notify waiter when all ready
    const order = state.orders.find((o) => o.id === orderId);
    if (order && order.status === "ready" && order.waiterId) {
      pushNotification({
        userId: order.waiterId,
        type: "order_ready",
        title: "Order ready for pickup",
        message: `${order.orderNumber} ready at the pass`,
        orderId,
      });
    }
  },
  collectPayment(id: string, method: PaymentMethod) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id
          ? { ...o, paymentStatus: "paid", paymentMethod: method, updatedAt: new Date().toISOString() }
          : o,
      ),
    }));
    toast.success("Payment collected");
  },
};

function pushNotification(n: Omit<Notification, "id" | "read" | "createdAt">) {
  setState((s) => ({
    ...s,
    notifications: [
      { ...n, id: `n_${Date.now()}_${Math.random()}`, read: false, createdAt: new Date().toISOString() },
      ...s.notifications,
    ],
  }));
}

export const notifications = {
  markRead(id: string) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },
  markAllRead(userId: string) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    }));
  },
};

export const session = {
  setRole(role: Role) {
    const u = initialStaff.find((s) => s.role === role);
    setState((s) => ({ ...s, activeRole: role, activeUserId: u?.id ?? s.activeUserId }));
  },
};
