import type { MenuCategory, MenuItem, Staff } from "@/types";

export const categories: MenuCategory[] = [
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "chicken", name: "Chicken", icon: "🍗" },
  { id: "salads", name: "Salads", icon: "🥗" },
  { id: "sides", name: "Sides", icon: "🍟" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
];

const cheeseMod = {
  id: "g_cheese",
  name: "Cheese",
  selectionType: "single" as const,
  required: true,
  options: [
    { id: "american", name: "American", priceAdjustment: 0 },
    { id: "cheddar", name: "Cheddar", priceAdjustment: 0.5 },
    { id: "swiss", name: "Swiss", priceAdjustment: 0.75 },
  ],
};
const extrasMod = {
  id: "g_extras",
  name: "Extra Toppings",
  selectionType: "multiple" as const,
  required: false,
  options: [
    { id: "bacon", name: "Bacon", priceAdjustment: 1.5 },
    { id: "avocado", name: "Avocado", priceAdjustment: 1.0 },
    { id: "egg", name: "Fried Egg", priceAdjustment: 1.25 },
    { id: "jalapeno", name: "Jalapeños", priceAdjustment: 0.5 },
  ],
};
const sauceMod = {
  id: "g_sauce",
  name: "Sauce",
  selectionType: "single" as const,
  required: false,
  options: [
    { id: "none", name: "No Sauce", priceAdjustment: 0 },
    { id: "bbq", name: "BBQ", priceAdjustment: 0 },
    { id: "spicy", name: "Spicy Mayo", priceAdjustment: 0 },
    { id: "garlic", name: "Garlic Aioli", priceAdjustment: 0 },
  ],
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=80`;

export const menuItems: MenuItem[] = [
  { id: "m1", name: "Classic Beef Burger", description: "Juicy beef patty, lettuce, tomato, house sauce", price: 12.99, image: img("photo-1568901346375-23c9450c58cd"), categoryId: "burgers", prepTime: 12, isAvailable: true, isFeatured: true, tags: ["popular"], station: "Grill", calories: 650, modifierGroups: [cheeseMod, extrasMod, sauceMod] },
  { id: "m2", name: "Double Smash Burger", description: "Two smashed patties, double cheese, pickles", price: 15.49, image: img("photo-1572802419224-296b0aeee0d9"), categoryId: "burgers", prepTime: 14, isAvailable: true, isFeatured: true, tags: ["bestseller"], station: "Grill", calories: 880, modifierGroups: [cheeseMod, extrasMod] },
  { id: "m3", name: "Veggie Mushroom Burger", description: "Portobello, halloumi, arugula, truffle mayo", price: 13.5, image: img("photo-1525059696034-4967a729002e"), categoryId: "burgers", prepTime: 11, isAvailable: true, isFeatured: false, tags: ["veg"], station: "Grill", calories: 540, modifierGroups: [extrasMod] },
  { id: "m4", name: "Crispy Fried Chicken", description: "Buttermilk-brined, secret 11-spice blend, 3 pcs", price: 11.0, image: img("photo-1626645738196-c2a7c87a8f9a"), categoryId: "chicken", prepTime: 15, isAvailable: true, isFeatured: true, tags: ["signature"], station: "Grill", calories: 720, modifierGroups: [sauceMod] },
  { id: "m5", name: "Grilled Chicken Bowl", description: "Charred chicken, quinoa, roasted veg, tahini", price: 12.5, image: img("photo-1546069901-ba9599a7e63c"), categoryId: "chicken", prepTime: 10, isAvailable: true, isFeatured: false, tags: ["healthy"], station: "Grill", calories: 540, modifierGroups: [] },
  { id: "m6", name: "Spicy Chicken Wings", description: "8 wings tossed in house hot sauce + blue cheese", price: 9.99, image: img("photo-1608039755401-742074f0548d"), categoryId: "chicken", prepTime: 13, isAvailable: true, isFeatured: false, tags: ["spicy"], station: "Grill", calories: 610, modifierGroups: [sauceMod] },
  { id: "m7", name: "Caesar Salad", description: "Romaine, parmesan, croutons, anchovy dressing", price: 8.5, image: img("photo-1550304943-4f24f54ddde9"), categoryId: "salads", prepTime: 5, isAvailable: true, isFeatured: false, tags: [], station: "Salad", calories: 320, modifierGroups: [] },
  { id: "m8", name: "Harvest Grain Bowl", description: "Farro, kale, roasted squash, pomegranate, feta", price: 11.5, image: img("photo-1512621776951-a57141f2eefd"), categoryId: "salads", prepTime: 6, isAvailable: true, isFeatured: true, tags: ["veg", "healthy"], station: "Salad", calories: 410, modifierGroups: [] },
  { id: "m9", name: "Truffle Parmesan Fries", description: "Hand-cut fries, truffle oil, shaved parmesan", price: 6.5, image: img("photo-1576107232684-1279f390859f"), categoryId: "sides", prepTime: 8, isAvailable: true, isFeatured: true, tags: [], station: "Grill", calories: 480, modifierGroups: [] },
  { id: "m10", name: "Onion Rings", description: "Beer-battered, crispy, served with chipotle dip", price: 5.5, image: img("photo-1639024471283-03518883512d"), categoryId: "sides", prepTime: 7, isAvailable: true, isFeatured: false, tags: [], station: "Grill", calories: 390, modifierGroups: [] },
  { id: "m11", name: "Sweet Potato Wedges", description: "Smoky paprika, garlic aioli", price: 5.0, image: img("photo-1604908554007-1a5bc0e6db97"), categoryId: "sides", prepTime: 9, isAvailable: true, isFeatured: false, tags: ["veg"], station: "Grill", calories: 350, modifierGroups: [] },
  { id: "m12", name: "Fresh Lemonade", description: "Cold-pressed lemon, mint, raw cane sugar", price: 4.0, image: img("photo-1621263764928-df1444c5e859"), categoryId: "beverages", prepTime: 2, isAvailable: true, isFeatured: false, tags: [], station: "Beverage", calories: 140, modifierGroups: [] },
  { id: "m13", name: "Iced Latte", description: "Double espresso, oat milk, over ice", price: 4.5, image: img("photo-1517701604599-bb29b565090c"), categoryId: "beverages", prepTime: 3, isAvailable: true, isFeatured: true, tags: [], station: "Beverage", calories: 120, modifierGroups: [] },
  { id: "m14", name: "Craft Cola", description: "Small-batch cola, vanilla & citrus notes", price: 3.5, image: img("photo-1581636625402-29b2a704ef13"), categoryId: "beverages", prepTime: 1, isAvailable: true, isFeatured: false, tags: [], station: "Beverage", calories: 150, modifierGroups: [] },
  { id: "m15", name: "Molten Chocolate Cake", description: "Warm cake, gooey center, vanilla bean ice cream", price: 7.5, image: img("photo-1606313564200-e75d5e30476c"), categoryId: "desserts", prepTime: 9, isAvailable: true, isFeatured: true, tags: ["sweet"], station: "Dessert", calories: 540, modifierGroups: [] },
  { id: "m16", name: "Cheesecake", description: "New York-style, berry compote", price: 6.5, image: img("photo-1567171466295-4afa63d45416"), categoryId: "desserts", prepTime: 3, isAvailable: true, isFeatured: false, tags: [], station: "Dessert", calories: 460, modifierGroups: [] },
];

export const staff: Staff[] = [
  { id: "u_jane", name: "Jane", role: "waiter", activeOrders: 0 },
  { id: "u_mike", name: "Mike", role: "waiter", activeOrders: 0 },
  { id: "u_amara", name: "Amara", role: "waiter", activeOrders: 0 },
  { id: "u_james", name: "James", role: "kitchen" },
  { id: "u_sarah", name: "Sarah", role: "cashier" },
  { id: "u_john", name: "John", role: "manager" },
];

export const tables = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
