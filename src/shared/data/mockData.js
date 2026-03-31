// IRA Master Data & Simulation Layer
export const HQ_MASTER_CATALOG = [
  { id: 'master_1', name: 'iPhone 15 Pro Screen', baseCost: 245.00, category: 'Screens', suggestedRetail: 320.00 },
  { id: 'master_2', name: 'Samsung S23 Ultra Battery', baseCost: 85.00, category: 'Batteries', suggestedRetail: 120.00 },
  { id: 'master_3', name: 'Google Pixel 8 Charging Port', baseCost: 55.00, category: 'Charging Ports', suggestedRetail: 89.00 },
  { id: 'master_4', name: 'iPhone 14 Pro Max Back Glass', baseCost: 195.00, category: 'Glass', suggestedRetail: 240.00 },
  { id: 'master_5', name: 'MacBook Air M2 Keyboard', baseCost: 210.00, category: 'Keyboards', suggestedRetail: 280.00 },
  { id: 'master_6', name: 'iPad Pro 12.9 Display', baseCost: 320.00, category: 'Screens', suggestedRetail: 395.00 },
];

export const ALLIANCE_SHOPS = [
  { 
    id: 'shop_dublin_01', 
    name: "O'Neill's Repairs", 
    location: 'Dublin', 
    dist: 1.2, 
    inventory: [
      { id: 'master_1', active: true, customPrice: 299.00 },
      { id: 'master_2', active: true, customPrice: 120.00 },
      { id: 'master_3', active: true, customPrice: 89.00 },
      { id: 'master_4', active: true, customPrice: 240.00 },
      { id: 'master_5', active: false, customPrice: 280.00 },
      { id: 'master_6', active: true, customPrice: 395.00 },
    ]
  },
  { id: 'shop_cork_01', name: "Lee Side Tech", location: 'Cork', dist: 250, inventory: [] },
  { id: 'shop_galway_01', name: "Western Repairs", location: 'Galway', dist: 200, inventory: [] },
];

export const REPAIR_STATUS = ['Pending', 'In Progress', 'Completed', 'Warranty Claim'];
