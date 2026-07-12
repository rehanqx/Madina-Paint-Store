export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "customer";
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM - 12:00 PM"
  details?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface PaintService {
  id: string;
  title: string;
  description: string;
  priceEstimate?: string;
  imageUrl?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string; // e.g., "interior", "exterior", "commercial", "residential"
  description?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  colorName: string;
  hexCode?: string;
  category: string; // e.g., "interior paint", "exterior paint", "primer", "tools"
  size: string; // e.g., "1 Gallon", "5 Gallon"
  price: number;
  stockCount: number;
  updatedAt: string;
}
