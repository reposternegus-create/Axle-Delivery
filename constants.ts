import { Restaurant } from './types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Karachi Grill House',
    image: 'https://picsum.photos/400/300?random=1',
    rating: 4.8,
    deliveryTime: '25-35 min',
    categories: ['BBQ', 'Desi'],
    menu: [
      { id: 'm1', name: 'Seekh Kebab Platter', description: '4 pieces of beef seekh kebab with puri.', price: 850, image: 'https://picsum.photos/200/200?random=11', category: 'BBQ' },
      { id: 'm2', name: 'Chicken Tikka', description: 'Spicy leg piece with raita.', price: 450, image: 'https://picsum.photos/200/200?random=12', category: 'BBQ' },
    ]
  },
  {
    id: 'r2',
    name: 'Lahore Spice',
    image: 'https://picsum.photos/400/300?random=2',
    rating: 4.5,
    deliveryTime: '30-45 min',
    categories: ['Karahi', 'Mains'],
    menu: [
      { id: 'm3', name: 'Chicken Karahi Half', description: 'Desi ghee prepared fresh karahi.', price: 1200, image: 'https://picsum.photos/200/200?random=13', category: 'Mains' },
      { id: 'm4', name: 'Garlic Naan', description: 'Fresh oven baked naan with garlic butter.', price: 120, image: 'https://picsum.photos/200/200?random=14', category: 'Sides' },
    ]
  },
  {
    id: 'r3',
    name: 'Cheezious Pizza',
    image: 'https://picsum.photos/400/300?random=3',
    rating: 4.9,
    deliveryTime: '40-50 min',
    categories: ['Pizza', 'Fast Food'],
    menu: [
      { id: 'm5', name: 'Crown Crust Large', description: 'Stuffed crust with chicken fajita.', price: 2100, image: 'https://picsum.photos/200/200?random=15', category: 'Pizza' },
      { id: 'm6', name: 'Hot Wings (6pcs)', description: 'Spicy breaded wings.', price: 650, image: 'https://picsum.photos/200/200?random=16', category: 'Sides' },
    ]
  }
];