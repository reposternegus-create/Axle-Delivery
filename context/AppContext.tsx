import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Restaurant, CartItem, OrderStatus, UserRole, User, Feedback } from '../types';
import * as storage from '../services/storage';

interface AppContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  restaurants: Restaurant[];
  orders: Order[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (restaurantId: string, restaurantName: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, riderDetails?: any) => void;
  assignRider: (orderId: string, riderDetails: any) => void;
  markRiderArrived: (orderId: string) => void;
  addFeedback: (orderId: string, feedback: Feedback) => void;
  refreshData: () => void;
  settleRiderDebt: (riderId: string) => void;
  riders: User[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setAuthUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [riders, setRiders] = useState<User[]>([]);

  // Initialize
  useEffect(() => {
    storage.initStorage();
    refreshData();
    const storedUser = storage.getCurrentUser();
    if (storedUser) setAuthUser(storedUser);
  }, []);

  const refreshData = () => {
    setRestaurants(storage.getStoredRestaurants());
    setOrders(storage.getStoredOrders());
    // Filter users to find riders for Admin view
    const allUsers = storage.getStoredUsers();
    setRiders(allUsers.filter(u => u.role === UserRole.RIDER));
  };

  const login = (user: User) => {
    storage.saveUser(user);
    storage.setCurrentUser(user);
    setAuthUser(user);
    refreshData();
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setAuthUser(null);
    setCart([]);
  };

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

  const placeOrder = (restaurantId: string, restaurantName: string): Order | undefined => {
    if (!currentUser) return undefined;
    
    const itemTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 150;
    const platformFee = 150;
    const total = itemTotal + deliveryFee + platformFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      customerId: currentUser.id,
      restaurantId,
      restaurantName,
      items: [...cart],
      itemTotal,
      deliveryFee,
      platformFee,
      total,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      deliveryAddress: currentUser.address || 'Address not provided',
      deliveryLocation: currentUser.location,
      paymentMethod: 'COD',
      riderArrived: false
    };
    storage.saveOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, riderDetails?: any) => {
    const allOrders = storage.getStoredOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex >= 0) {
      const order = allOrders[orderIndex];
      order.status = status;
      
      if (riderDetails) {
        order.riderId = riderDetails.riderId;
        order.riderName = riderDetails.riderName;
        order.riderPhone = riderDetails.riderPhone;
        order.estimatedTime = '20 mins'; 
      }

      // FINANCIAL LOGIC ON DELIVERY
      if (status === OrderStatus.DELIVERED && order.riderId) {
          // Find the rider
          const allUsers = storage.getStoredUsers();
          const riderIndex = allUsers.findIndex(u => u.id === order.riderId);
          if (riderIndex >= 0) {
              const rider = allUsers[riderIndex];
              // Rider collects TOTAL cash.
              // Rider keeps DELIVERY FEE (150).
              // Rider owes Platform: TOTAL - DELIVERY FEE.
              const cashCollected = order.total;
              const riderShare = order.deliveryFee;
              const debtToPlatform = cashCollected - riderShare;

              rider.amountOwed = (rider.amountOwed || 0) + debtToPlatform;
              
              // Update Rider in Storage
              allUsers[riderIndex] = rider;
              localStorage.setItem('axle_users', JSON.stringify(allUsers));
              
              // If current user is the rider, update state
              if (currentUser && currentUser.id === rider.id) {
                  setAuthUser(rider);
                  storage.setCurrentUser(rider);
              }
              setRiders(allUsers.filter(u => u.role === UserRole.RIDER));
          }
      }

      storage.saveOrder(order);
      setOrders([...allOrders]); 
    }
  };

  const assignRider = (orderId: string, riderDetails: any) => {
    const allOrders = storage.getStoredOrders();
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        order.riderId = riderDetails.riderId;
        order.riderName = riderDetails.riderName;
        order.riderPhone = riderDetails.riderPhone;
        order.estimatedTime = 'Heading to Restaurant';
        order.riderArrived = false;
        storage.saveOrder(order);
        setOrders(allOrders);
    }
  }

  const markRiderArrived = (orderId: string) => {
      const allOrders = storage.getStoredOrders();
      const order = allOrders.find(o => o.id === orderId);
      if (order) {
          order.riderArrived = true;
          order.estimatedTime = 'At Restaurant';
          storage.saveOrder(order);
          setOrders(allOrders);
      }
  }

  const settleRiderDebt = (riderId: string) => {
      const allUsers = storage.getStoredUsers();
      const riderIndex = allUsers.findIndex(u => u.id === riderId);
      if (riderIndex >= 0) {
          allUsers[riderIndex].amountOwed = 0;
          allUsers[riderIndex].isSuspended = false;
          localStorage.setItem('axle_users', JSON.stringify(allUsers));
          setRiders(allUsers.filter(u => u.role === UserRole.RIDER));
          
          if (currentUser && currentUser.id === riderId) {
            const updatedUser = allUsers[riderIndex];
            setAuthUser(updatedUser);
            storage.setCurrentUser(updatedUser);
          }
      }
  };

  const addFeedback = (orderId: string, feedback: Feedback) => {
    const allOrders = storage.getStoredOrders();
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
      order.feedback = feedback;
      storage.saveOrder(order);
      setOrders(allOrders);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      logout,
      role: currentUser?.role || UserRole.NONE,
      setRole: () => {}, 
      restaurants,
      orders,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      assignRider,
      markRiderArrived,
      addFeedback,
      refreshData,
      settleRiderDebt,
      riders
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