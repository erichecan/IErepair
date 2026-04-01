import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── 1. HQ Admin ───
  const admin = await prisma.hqAdmin.create({
    data: {
      id: uuid(),
      email: 'admin@ira.ie',
      name: 'IRA Admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'super_admin',
    },
  });
  console.log('  ✓ HQ Admin created');

  // ─── 2. Merchants ───
  const merchantData = [
    { slug: 'oneills-dublin', name: "O'Neill's Repairs", email: 'info@oneills.ie', phone: '01 234 5678', address: "12 O'Connell Street", city: 'Dublin', county: 'Dublin', eircode: 'D01 F6X3', latitude: 53.3498, longitude: -6.2603, description: 'Premium mobile repair service in the heart of Dublin.', ratingAvg: 4.8, ratingCount: 312 },
    { slug: 'corkfix-mobile', name: 'CorkFix Mobile', email: 'hello@corkfix.ie', phone: '021 555 1234', address: '45 Patrick Street', city: 'Cork', county: 'Cork', eircode: 'T12 XY45', latitude: 51.8985, longitude: -8.4756, description: 'Fast and reliable phone repairs in Cork city centre.', ratingAvg: 4.5, ratingCount: 189 },
    { slug: 'galway-phone-clinic', name: 'Galway Phone Clinic', email: 'info@galwayphoneclinic.ie', phone: '091 333 4567', address: '8 Shop Street', city: 'Galway', county: 'Galway', eircode: 'H91 AB12', latitude: 53.2707, longitude: -9.0568, description: 'Expert phone repairs in the West of Ireland.', ratingAvg: 4.6, ratingCount: 97 },
  ];

  const merchants = [];
  for (const m of merchantData) {
    const merchant = await prisma.merchant.create({
      data: {
        id: uuid(), ...m,
        passwordHash: await bcrypt.hash('merchant123', 10),
        status: 'active',
        activatedAt: new Date(),
        activatedById: admin.id,
      },
    });
    merchants.push(merchant);
  }
  console.log('  ✓ 3 Merchants created');

  // ─── 3. Business Hours & Slots ───
  for (const merchant of merchants) {
    for (let day = 0; day < 7; day++) {
      await prisma.merchantBusinessHour.create({
        data: {
          merchantId: merchant.id,
          dayOfWeek: day,
          openTime: day === 0 ? null : '09:00',
          closeTime: day === 0 ? null : (day === 6 ? '16:00' : '18:00'),
          isClosed: day === 0,
        },
      });
    }
    await prisma.merchantBookingSlot.create({
      data: { merchantId: merchant.id, slotDuration: 30, maxConcurrent: 3, bufferMinutes: 0, advanceDays: 14 },
    });
  }
  console.log('  ✓ Business hours & slots configured');

  // ─── 4. Brands ───
  const brandNames = ['Apple', 'Samsung', 'Google', 'Huawei', 'Xiaomi', 'OnePlus'];
  const brands = {};
  for (let i = 0; i < brandNames.length; i++) {
    brands[brandNames[i]] = await prisma.masterBrand.create({
      data: { id: uuid(), name: brandNames[i], sortOrder: i },
    });
  }
  console.log('  ✓ 6 Brands created');

  // ─── 5. Categories ───
  const categoryNames = ['Screen Replacement', 'Battery Replacement', 'Charging Port', 'Water Damage', 'Back Glass'];
  const categoryIcons = ['📱', '🔋', '🔌', '💧', '🪟'];
  const categories = {};
  for (let i = 0; i < categoryNames.length; i++) {
    categories[categoryNames[i]] = await prisma.masterCategory.create({
      data: { id: uuid(), name: categoryNames[i], icon: categoryIcons[i], sortOrder: i },
    });
  }
  console.log('  ✓ 5 Categories created');

  // ─── 6. Devices ───
  const deviceData = [
    { brand: 'Apple', name: 'iPhone 15 Pro' },
    { brand: 'Apple', name: 'iPhone 14' },
    { brand: 'Apple', name: 'iPhone 13' },
    { brand: 'Samsung', name: 'Galaxy S24 Ultra' },
    { brand: 'Samsung', name: 'Galaxy S23' },
    { brand: 'Samsung', name: 'Galaxy A54' },
    { brand: 'Google', name: 'Pixel 8 Pro' },
    { brand: 'Google', name: 'Pixel 8' },
    { brand: 'Huawei', name: 'P60 Pro' },
    { brand: 'Huawei', name: 'Mate 50' },
    { brand: 'Xiaomi', name: 'Xiaomi 14' },
    { brand: 'Xiaomi', name: 'Redmi Note 13' },
    { brand: 'OnePlus', name: 'OnePlus 12' },
    { brand: 'OnePlus', name: 'OnePlus Nord 3' },
  ];
  const devices = {};
  for (let i = 0; i < deviceData.length; i++) {
    const d = deviceData[i];
    devices[d.name] = await prisma.masterDevice.create({
      data: { id: uuid(), brandId: brands[d.brand].id, name: d.name, sortOrder: i },
    });
  }
  console.log('  ✓ 14 Devices created');

  // ─── 7. Master Products ───
  const productData = [
    // Apple iPhone 15 Pro
    { device: 'iPhone 15 Pro', category: 'Screen Replacement', sku: 'APL-IP15P-SCR', baseCost: 285, suggestedPrice: 349, time: 45 },
    { device: 'iPhone 15 Pro', category: 'Battery Replacement', sku: 'APL-IP15P-BAT', baseCost: 45, suggestedPrice: 79, time: 30 },
    { device: 'iPhone 15 Pro', category: 'Charging Port', sku: 'APL-IP15P-CHG', baseCost: 55, suggestedPrice: 89, time: 35 },
    { device: 'iPhone 15 Pro', category: 'Back Glass', sku: 'APL-IP15P-BGL', baseCost: 95, suggestedPrice: 149, time: 40 },
    // Apple iPhone 14
    { device: 'iPhone 14', category: 'Screen Replacement', sku: 'APL-IP14-SCR', baseCost: 220, suggestedPrice: 279, time: 40 },
    { device: 'iPhone 14', category: 'Battery Replacement', sku: 'APL-IP14-BAT', baseCost: 35, suggestedPrice: 69, time: 25 },
    { device: 'iPhone 14', category: 'Charging Port', sku: 'APL-IP14-CHG', baseCost: 45, suggestedPrice: 79, time: 30 },
    // Apple iPhone 13
    { device: 'iPhone 13', category: 'Screen Replacement', sku: 'APL-IP13-SCR', baseCost: 180, suggestedPrice: 239, time: 35 },
    { device: 'iPhone 13', category: 'Battery Replacement', sku: 'APL-IP13-BAT', baseCost: 30, suggestedPrice: 59, time: 25 },
    // Samsung S24 Ultra
    { device: 'Galaxy S24 Ultra', category: 'Screen Replacement', sku: 'SAM-S24U-SCR', baseCost: 310, suggestedPrice: 389, time: 60 },
    { device: 'Galaxy S24 Ultra', category: 'Battery Replacement', sku: 'SAM-S24U-BAT', baseCost: 40, suggestedPrice: 69, time: 30 },
    { device: 'Galaxy S24 Ultra', category: 'Back Glass', sku: 'SAM-S24U-BGL', baseCost: 85, suggestedPrice: 129, time: 40 },
    // Samsung S23
    { device: 'Galaxy S23', category: 'Screen Replacement', sku: 'SAM-S23-SCR', baseCost: 250, suggestedPrice: 319, time: 50 },
    { device: 'Galaxy S23', category: 'Battery Replacement', sku: 'SAM-S23-BAT', baseCost: 35, suggestedPrice: 59, time: 30 },
    // Samsung A54
    { device: 'Galaxy A54', category: 'Screen Replacement', sku: 'SAM-A54-SCR', baseCost: 120, suggestedPrice: 179, time: 40 },
    // Google Pixel 8 Pro
    { device: 'Pixel 8 Pro', category: 'Screen Replacement', sku: 'GOO-PX8P-SCR', baseCost: 230, suggestedPrice: 299, time: 50 },
    { device: 'Pixel 8 Pro', category: 'Battery Replacement', sku: 'GOO-PX8P-BAT', baseCost: 40, suggestedPrice: 69, time: 30 },
    // Google Pixel 8
    { device: 'Pixel 8', category: 'Screen Replacement', sku: 'GOO-PX8-SCR', baseCost: 190, suggestedPrice: 249, time: 45 },
    // Huawei P60 Pro
    { device: 'P60 Pro', category: 'Screen Replacement', sku: 'HUA-P60P-SCR', baseCost: 200, suggestedPrice: 269, time: 50 },
    // Xiaomi 14
    { device: 'Xiaomi 14', category: 'Screen Replacement', sku: 'XIA-14-SCR', baseCost: 160, suggestedPrice: 219, time: 40 },
    { device: 'Xiaomi 14', category: 'Battery Replacement', sku: 'XIA-14-BAT', baseCost: 30, suggestedPrice: 55, time: 25 },
    // Redmi Note 13
    { device: 'Redmi Note 13', category: 'Screen Replacement', sku: 'XIA-RN13-SCR', baseCost: 80, suggestedPrice: 129, time: 35 },
    // OnePlus 12
    { device: 'OnePlus 12', category: 'Screen Replacement', sku: 'OPL-12-SCR', baseCost: 200, suggestedPrice: 259, time: 45 },
    { device: 'OnePlus 12', category: 'Battery Replacement', sku: 'OPL-12-BAT', baseCost: 35, suggestedPrice: 65, time: 25 },
    // OnePlus Nord 3
    { device: 'OnePlus Nord 3', category: 'Screen Replacement', sku: 'OPL-N3-SCR', baseCost: 110, suggestedPrice: 159, time: 35 },
    // Water damage (cross-device)
    { device: 'iPhone 15 Pro', category: 'Water Damage', sku: 'APL-IP15P-WTR', baseCost: 120, suggestedPrice: 199, time: 90 },
    { device: 'Galaxy S24 Ultra', category: 'Water Damage', sku: 'SAM-S24U-WTR', baseCost: 110, suggestedPrice: 189, time: 90 },
  ];

  const products = {};
  for (const p of productData) {
    const name = `${p.device} ${categories[p.category].name}`;
    products[p.sku] = await prisma.masterProduct.create({
      data: {
        id: uuid(), deviceId: devices[p.device].id, categoryId: categories[p.category].id,
        sku: p.sku, name, baseCost: p.baseCost, suggestedPrice: p.suggestedPrice, estimatedTime: p.time,
      },
    });
  }
  console.log(`  ✓ ${productData.length} Master Products created`);

  // ─── 8. Merchant Products ───
  const skusPerMerchant = [
    // O'Neill's — 20 products (Apple-heavy)
    ['APL-IP15P-SCR', 'APL-IP15P-BAT', 'APL-IP15P-CHG', 'APL-IP15P-BGL', 'APL-IP15P-WTR', 'APL-IP14-SCR', 'APL-IP14-BAT', 'APL-IP14-CHG', 'APL-IP13-SCR', 'APL-IP13-BAT', 'SAM-S24U-SCR', 'SAM-S24U-BAT', 'SAM-S24U-BGL', 'SAM-S23-SCR', 'SAM-S23-BAT', 'GOO-PX8P-SCR', 'GOO-PX8P-BAT', 'GOO-PX8-SCR', 'SAM-S24U-WTR', 'SAM-A54-SCR'],
    // CorkFix — 15 products
    ['APL-IP15P-SCR', 'APL-IP15P-BAT', 'APL-IP14-SCR', 'APL-IP14-BAT', 'APL-IP13-SCR', 'SAM-S24U-SCR', 'SAM-S24U-BAT', 'SAM-S23-SCR', 'SAM-S23-BAT', 'GOO-PX8-SCR', 'XIA-14-SCR', 'XIA-14-BAT', 'XIA-RN13-SCR', 'OPL-12-SCR', 'OPL-12-BAT'],
    // Galway — 12 products
    ['APL-IP15P-SCR', 'APL-IP15P-BAT', 'APL-IP14-SCR', 'APL-IP13-SCR', 'SAM-S24U-SCR', 'SAM-S23-SCR', 'GOO-PX8P-SCR', 'GOO-PX8-SCR', 'HUA-P60P-SCR', 'OPL-12-SCR', 'OPL-N3-SCR', 'XIA-14-SCR'],
  ];

  const merchantProducts = {};
  for (let mi = 0; mi < merchants.length; mi++) {
    for (const sku of skusPerMerchant[mi]) {
      const product = products[sku];
      const priceVariation = 0.9 + Math.random() * 0.2; // 90%-110% of suggested
      const mp = await prisma.merchantProduct.create({
        data: {
          id: uuid(), merchantId: merchants[mi].id, productId: product.id,
          myPrice: Math.round(Number(product.suggestedPrice) * priceVariation * 100) / 100,
        },
      });
      merchantProducts[`${mi}-${sku}`] = mp;
    }
  }
  console.log('  ✓ Merchant products linked');

  // ─── 9. Customers ───
  const customerData = [
    { name: 'Sarah Murphy', email: 'sarah@example.com', phone: '087 123 4567' },
    { name: 'James Kelly', email: 'james@example.com', phone: '086 234 5678' },
    { name: 'Emma Lynch', email: 'emma@example.com', phone: '085 345 6789' },
    { name: 'Liam O\'Brien', email: 'liam@example.com', phone: '083 456 7890' },
    { name: 'Aoife Ryan', email: 'aoife@example.com', phone: '089 567 8901' },
  ];
  const customers = [];
  for (const c of customerData) {
    customers.push(await prisma.customer.create({
      data: { id: uuid(), ...c, passwordHash: await bcrypt.hash('customer123', 10) },
    }));
  }
  console.log('  ✓ 5 Customers created');

  // ─── 10. Bookings ───
  const today = new Date();
  const bookingData = [
    { ci: 0, mi: 0, sku: 'APL-IP15P-SCR', status: 'completed', daysAgo: 30 },
    { ci: 1, mi: 0, sku: 'SAM-S24U-BAT', status: 'completed', daysAgo: 20 },
    { ci: 2, mi: 1, sku: 'APL-IP14-SCR', status: 'completed', daysAgo: 15 },
    { ci: 3, mi: 0, sku: 'APL-IP15P-WTR', status: 'no_show', daysAgo: 10 },
    { ci: 4, mi: 2, sku: 'GOO-PX8P-SCR', status: 'completed', daysAgo: 7 },
    { ci: 0, mi: 1, sku: 'SAM-S24U-SCR', status: 'in_progress', daysAgo: 0 },
    { ci: 1, mi: 0, sku: 'APL-IP15P-BAT', status: 'checked_in', daysAgo: 0 },
    { ci: 2, mi: 2, sku: 'OPL-12-SCR', status: 'confirmed', daysAgo: -1 },
    { ci: 3, mi: 0, sku: 'APL-IP14-CHG', status: 'confirmed', daysAgo: -2 },
    { ci: 4, mi: 1, sku: 'XIA-14-SCR', status: 'confirmed', daysAgo: -3 },
  ];

  const bookings = [];
  for (let i = 0; i < bookingData.length; i++) {
    const bd = bookingData[i];
    const customer = customers[bd.ci];
    const merchant = merchants[bd.mi];
    const mp = merchantProducts[`${bd.mi}-${bd.sku}`];
    const product = products[bd.sku];
    const price = Number(mp.myPrice);
    const deposit = Math.round(price * 0.2 * 100) / 100;
    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() - bd.daysAgo);
    const bookingNum = `IRA-${bookingDate.toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`;

    const booking = await prisma.booking.create({
      data: {
        id: uuid(), bookingNumber: bookingNum, customerId: customer.id, merchantId: merchant.id,
        merchantProductId: mp.id, serviceName: product.name, servicePrice: price,
        depositAmount: deposit, remainingAmount: Math.round((price - deposit) * 100) / 100,
        bookingDate, bookingTime: `${9 + i}:00`, estimatedDuration: product.estimatedTime,
        status: bd.status, customerName: customer.name, customerPhone: customer.phone,
        qrCode: `QR-${bookingNum}`,
        checkedInAt: ['checked_in', 'in_progress', 'completed'].includes(bd.status) ? bookingDate : null,
        completedAt: bd.status === 'completed' ? bookingDate : null,
      },
    });
    bookings.push(booking);

    // Deposit record
    await prisma.deposit.create({
      data: {
        bookingId: booking.id, amount: deposit,
        stripePaymentId: `pi_demo_${bookingNum}`, stripeCheckoutId: `cs_demo_${bookingNum}`,
        status: bd.status === 'no_show' ? 'forfeited' : (bd.status === 'cancelled_by_customer' ? 'refunded' : 'paid'),
      },
    });
  }
  console.log('  ✓ 10 Bookings + Deposits created');

  // ─── 11. Warranties (from completed bookings) ───
  const completedBookings = bookings.filter((_, i) => bookingData[i].status === 'completed');
  for (const booking of completedBookings) {
    const startDate = booking.completedAt || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 180);
    const bd = bookingData[bookings.indexOf(booking)];
    await prisma.warranty.create({
      data: {
        id: uuid(),
        warrantyNumber: `IRA-W-${startDate.toISOString().slice(0, 10).replace(/-/g, '')}-${uuid().slice(0, 4).toUpperCase()}`,
        bookingId: booking.id, customerId: booking.customerId,
        originalMerchantId: booking.merchantId, productId: products[bd.sku].id,
        deviceName: products[bd.sku].name.split(' ').slice(0, -2).join(' '),
        serviceName: products[bd.sku].name,
        startDate, endDate,
      },
    });
  }
  console.log(`  ✓ ${completedBookings.length} Warranties created`);

  // ─── 12. Commission Rules ───
  await prisma.commissionRule.create({
    data: { name: 'Global Default', rate: 0.10, scopeType: 'global', startDate: new Date('2025-01-01'), priority: 0, createdById: admin.id },
  });
  await prisma.commissionRule.create({
    data: { name: 'Dublin Summer Promo', rate: 0.05, scopeType: 'region', scopeValue: 'Dublin', startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'), priority: 10, createdById: admin.id },
  });
  await prisma.commissionRule.create({
    data: { name: 'Galway New Shop Incentive', rate: 0, scopeType: 'merchant', scopeValue: merchants[2].id, startDate: new Date('2025-10-01'), endDate: new Date('2026-01-01'), priority: 20, isActive: false, createdById: admin.id },
  });
  console.log('  ✓ 3 Commission Rules created');

  // ─── 13. Reviews ───
  const reviewData = [
    { bi: 0, rating: 5, comment: 'Excellent service! Screen looks brand new. Highly recommend.' },
    { bi: 1, rating: 4, comment: 'Quick battery swap, good price. Will come back.' },
    { bi: 2, rating: 5, comment: 'Very professional. Fixed my screen in under an hour.' },
    { bi: 4, rating: 4, comment: 'Great repair, Pixel screen looks perfect now.' },
  ];
  for (const r of reviewData) {
    const booking = bookings[r.bi];
    await prisma.review.create({
      data: {
        bookingId: booking.id, customerId: booking.customerId,
        merchantId: booking.merchantId, rating: r.rating, comment: r.comment,
      },
    });
  }
  console.log('  ✓ 4 Reviews created');

  console.log('\nSeed complete!');
  console.log('─────────────────────────────');
  console.log('Demo credentials:');
  console.log('  HQ Admin:  admin@ira.ie / admin123');
  console.log('  Merchants: info@oneills.ie / merchant123');
  console.log('             hello@corkfix.ie / merchant123');
  console.log('             info@galwayphoneclinic.ie / merchant123');
  console.log('  Customers: sarah@example.com (OTP login)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
