import { Restaurant } from './types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Blade & Burger',
    image: 'https://picsum.photos/400/300?random=1',
    rating: 4.8,
    deliveryTime: '25-35 min',
    categories: ['Burgers', 'American'],
    menu: [
      { id: 'm1', name: 'The Sledgehammer', description: 'Double beef patty, smoked bacon, cheddar, BBQ sauce.', price: 14.99, image: 'https://picsum.photos/200/200?random=11', category: 'Burgers' },
      { id: 'm2', name: 'Steel Cut Fries', description: 'Thick cut fries with sea salt and rosemary.', price: 5.99, image: 'https://picsum.photos/200/200?random=12', category: 'Sides' },
    ]
  },
  {
    id: 'r2',
    name: 'Iron Wok',
    image: 'https://picsum.photos/400/300?random=2',
    rating: 4.5,
    deliveryTime: '30-45 min',
    categories: ['Asian', 'Stir Fry'],
    menu: [
      { id: 'm3', name: 'Spicy Beef Basil', description: 'Wok-seared beef with thai basil and chili.', price: 16.50, image: 'https://picsum.photos/200/200?random=13', category: 'Mains' },
      { id: 'm4', name: 'Dumplings of Fury', description: 'Steamed pork dumplings with chili oil.', price: 9.00, image: 'https://picsum.photos/200/200?random=14', category: 'Appetizers' },
    ]
  },
  {
    id: 'r3',
    name: 'Timber Pizza Co.',
    image: 'https://picsum.photos/400/300?random=3',
    rating: 4.9,
    deliveryTime: '40-50 min',
    categories: ['Pizza', 'Italian'],
    menu: [
      { id: 'm5', name: 'Woodsman Special', description: 'Mushrooms, truffle oil, mozzarella, thyme.', price: 18.00, image: 'https://picsum.photos/200/200?random=15', category: 'Pizza' },
      { id: 'm6', name: 'Red Axe Pepperoni', description: 'Spicy pepperoni, red onions, hot honey.', price: 17.50, image: 'https://picsum.photos/200/200?random=16', category: 'Pizza' },
    ]
  }
];