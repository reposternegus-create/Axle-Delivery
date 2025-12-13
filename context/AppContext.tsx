import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Restaurant, CartItem, OrderStatus, UserRole } from '../types';
import { MOCK_RESTAURANTS } from '../constants';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  restaurants: Restaurant[];
  orders: Order[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (restaurantId: string, restaurantName: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  restaurantId: string; // Simulating logged in restaurant
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [restaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Simulating a specific restaurant login for demo purposes
  const restaurantId = 'r1'; 

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (restaurantId: string, restaurantName: string) => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      customerId: 'user-1',
      restaurantId,
      restaurantName,
      items: [...cart],
      total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      deliveryAddress: '123 Steel Street, Foundry City'
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      restaurants,
      orders,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      restaurantId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};