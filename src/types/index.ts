export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  firebaseUid?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  pricing: number;
  image_urls: string[];
  category: 'interior' | 'exterior' | 'commercial' | 'residential';
  createdAt: Date;
  updatedAt: Date;
}

export interface Gallery {
  id: string;
  image_url: string;
  title: string;
  service_category: string;
  description: string;
  order: number;
  createdAt: Date;
}

export interface Inventory {
  id: string;
  productName: string;
  color: string;
  openingStock: number;
  sold: number;
  currentStock: number;
  costPrice: number;
  supplierName: string;
  lastUpdated: Date;
  excelVersion: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  replied: boolean;
  repliedAt?: Date;
  createdAt: Date;
}

export interface Customer {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  lastBookingDate?: Date;
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  createdAt: Date;
}
