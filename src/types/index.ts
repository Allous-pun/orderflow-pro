export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";
export type PaymentMethod = "mpesa" | "card" | "cash" | "wallet";
export type OrderType = "dine-in" | "takeaway";
export type Role = "customer" | "waiter" | "kitchen" | "cashier" | "manager";

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
}
export interface ModifierGroup {
  id: string;
  name: string;
  selectionType: "single" | "multiple";
  required: boolean;
  options: ModifierOption[];
}
export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  prepTime: number;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  station: string;
  calories: number;
  modifierGroups: ModifierGroup[];
}
export interface CartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers: { optionId: string; name: string; priceAdjustment: number }[];
  notes?: string;
  station: string;
}
export interface OrderItem extends CartItem {
  status: "pending" | "preparing" | "ready" | "delivered";
}
export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentTiming: "pay-now" | "pay-later";
  waiterId?: string;
  waiterName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedPrepTime: number;
  loyaltyPointsEarned: number;
}
export interface Staff {
  id: string;
  name: string;
  role: Role;
  activeOrders?: number;
}
export interface Notification {
  id: string;
  userId: string;
  type: "order_assigned" | "order_ready" | "payment_request" | "new_order";
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}
