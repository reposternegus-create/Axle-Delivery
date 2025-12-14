export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  categories: string[];
  menu: MenuItem[];
  // Auth fields
  ownerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: { lat: number; lng: number };
  isVerified?: VerificationStatus;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Feedback {
  rating: number;
  comment: string;
  timestamp: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  timestamp: number;
  deliveryAddress: string;
  deliveryLocation?: { lat: number; lng: number };
  paymentMethod: 'COD'; // Restricted to COD
  // Tracking
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  estimatedTime?: string;
  riderLocation?: { lat: number; lng: number }; // Mock location
  riderArrived?: boolean; // New field to track if rider reached restaurant
  // Feedback
  feedback?: Feedback;
}

export enum UserRole {
  NONE = 'NONE',
  CUSTOMER = 'CUSTOMER',
  RESTAURANT = 'RESTAURANT',
  RIDER = 'RIDER',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  role: UserRole;
  name?: string;
  phone?: string;
  email?: string;
  // Customer specific
  address?: string; 
  location?: { lat: number; lng: number };
  // Rider specific
  riderIdUrl?: string;
  amountOwed?: number; // The amount the rider owes the platform (Wallet)
  isSuspended?: boolean;
  // Restaurant specific
  restaurantDetails?: Restaurant;
}