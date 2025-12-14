import { User, Order, Restaurant, UserRole, VerificationStatus, MenuItem } from '../types';
import { MOCK_RESTAURANTS } from '../constants';

const KEYS = {
  USERS: 'axle_users',
  ORDERS: 'axle_orders',
  RESTAURANTS: 'axle_restaurants',
  CURRENT_USER: 'axle_current_user'
};

// Initialize default data if empty
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.RESTAURANTS)) {
    localStorage.setItem(KEYS.RESTAURANTS, JSON.stringify(MOCK_RESTAURANTS));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
};

export const getStoredUsers = (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
export const saveUser = (user: User) => {
  const users = getStoredUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  // If restaurant, also update restaurant list
  if (user.role === UserRole.RESTAURANT && user.restaurantDetails) {
    saveRestaurant(user.restaurantDetails);
  }
};

export const getStoredRestaurants = (): Restaurant[] => JSON.parse(localStorage.getItem(KEYS.RESTAURANTS) || '[]');
export const saveRestaurant = (rest: Restaurant) => {
  const list = getStoredRestaurants();
  const idx = list.findIndex(r => r.id === rest.id);
  if (idx >= 0) list[idx] = rest;
  else list.push(rest);
  localStorage.setItem(KEYS.RESTAURANTS, JSON.stringify(list));
};

export const getStoredOrders = (): Order[] => JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
export const saveOrder = (order: Order) => {
  const list = getStoredOrders();
  const idx = list.findIndex(o => o.id === order.id);
  if (idx >= 0) list[idx] = order;
  else list.unshift(order);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(list));
};

export const getCurrentUser = (): User | null => {
  const str = localStorage.getItem(KEYS.CURRENT_USER);
  return str ? JSON.parse(str) : null;
};
export const setCurrentUser = (user: User | null) => {
  if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  else localStorage.removeItem(KEYS.CURRENT_USER);
};