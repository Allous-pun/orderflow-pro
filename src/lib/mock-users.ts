export type MockRole = "waiter" | "kitchen" | "manager" | "admin";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: MockRole;
  avatar: string;
}

export const mockUsers: MockUser[] = [
  {
    id: "u_waiter",
    name: "Jane Waweru",
    email: "waiter@demo.com",
    password: "waiter123",
    role: "waiter",
    avatar: "🧑‍🍳",
  },
  {
    id: "u_kitchen",
    name: "James Otieno",
    email: "kitchen@demo.com",
    password: "kitchen123",
    role: "kitchen",
    avatar: "👨‍🍳",
  },
  {
    id: "u_manager",
    name: "John Kamau",
    email: "manager@demo.com",
    password: "manager123",
    role: "manager",
    avatar: "🧑‍💼",
  },
  {
    id: "u_admin",
    name: "Amina Yusuf",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin",
    avatar: "🛡️",
  },
];

const AUTH_KEY = "rf_auth_v1";

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: MockRole;
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: AuthSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("rf-auth-change"));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("rf-auth-change"));
}

export function roleHome(role: MockRole): string {
  switch (role) {
    case "waiter":
      return "/waiter";
    case "kitchen":
      return "/kitchen";
    case "manager":
      return "/manager";
    case "admin":
      return "/admin";
  }
}
