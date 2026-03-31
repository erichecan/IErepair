/**
 * Ireland Repair Alliance - Master Catalog & Shop Database
 */

export const MASTER_CATALOG = [
  {
    id: 'apple-iphone-15-pro-screen',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Screen',
    baseCost: 245,
    suggestedPrice: 329,
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'apple-iphone-13-battery',
    brand: 'Apple',
    model: 'iPhone 13',
    category: 'Battery',
    baseCost: 35,
    suggestedPrice: 85,
    image: 'https://images.unsplash.com/photo-1635831671952-1f414e2c0709?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'samsung-s24-ultra-screen',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    category: 'Screen',
    baseCost: 210,
    suggestedPrice: 299,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'google-pixel-8-charging-port',
    brand: 'Google',
    model: 'Pixel 8',
    category: 'Charging Port',
    baseCost: 45,
    suggestedPrice: 99,
    image: 'https://images.unsplash.com/photo-1596558450268-9c27524965c2?auto=format&fit=crop&q=80&w=200'
  }
];

export const ALLIANCE_SHOPS = [
  {
    id: 'shop-dublin-01',
    name: "O'Neill's Repairs - Dublin City",
    location: { lat: 53.3498, lng: -6.2603 },
    address: "12 O'Connell St, Dublin 1",
    rating: 4.8,
    inventory: [
      { itemId: 'apple-iphone-15-pro-screen', price: 299 },
      { itemId: 'apple-iphone-13-battery', price: 79 },
      { itemId: 'google-pixel-8-charging-port', price: 89 }
    ]
  },
  {
    id: 'shop-cork-01',
    name: "Munster Mobile Lab",
    location: { lat: 51.8985, lng: -8.4756 },
    address: "84 Grand Parade, Cork",
    rating: 4.6,
    inventory: [
      { itemId: 'apple-iphone-15-pro-screen', price: 315 },
      { itemId: 'apple-iphone-13-battery', price: 85 }
    ]
  },
  {
    id: 'shop-galway-01',
    name: "Tribes Tech Solutions",
    location: { lat: 53.2707, lng: -9.0568 },
    address: "Shop Street, Galway",
    rating: 4.9,
    inventory: [
      { itemId: 'apple-iphone-15-pro-screen', price: 285 },
      { itemId: 'samsung-s24-ultra-screen', price: 280 }
    ]
  }
];
