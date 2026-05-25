import { Router } from 'express';
import prisma from '../../config/database.js';
import { haversineDistance } from '../../utils/geo.js';

const router = Router();

// GET /brands — list all active brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await prisma.masterBrand.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /brands/:id/devices — list devices for a brand
router.get('/brands/:id/devices', async (req, res) => {
  try {
    const devices = await prisma.masterDevice.findMany({
      where: { brandId: req.params.id },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /devices/:id/services — list master products for a device, grouped by category, with min price
router.get('/devices/:id/services', async (req, res) => {
  try {
    const products = await prisma.masterProduct.findMany({
      where: { deviceId: req.params.id, isActive: true },
      include: {
        category: true,
        merchantProducts: {
          where: { isActive: true },
          select: { myPrice: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Group by category and attach min price
    const grouped = {};
    for (const product of products) {
      const catName = product.category.name;
      if (!grouped[catName]) {
        grouped[catName] = {
          categoryId: product.category.id,
          categoryName: catName,
          icon: product.category.icon,
          services: [],
        };
      }

      const prices = product.merchantProducts.map(mp => parseFloat(mp.myPrice));
      const minPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(product.suggestedPrice);

      grouped[catName].services.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        baseCost: parseFloat(product.baseCost),
        suggestedPrice: parseFloat(product.suggestedPrice),
        minPrice,
        estimatedTime: product.estimatedTime,
        warrantyDays: product.warrantyDays,
        imageUrl: product.imageUrl,
        shopCount: product.merchantProducts.length,
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /search — find nearby shops for a specific service
// Query: ?device_id=&category_id=&lat=&lng=&radius=20
router.get('/search', async (req, res) => {
  try {
    const { device_id, category_id, lat, lng, radius = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    // Build product filter
    const productFilter = { isActive: true };
    if (device_id) productFilter.deviceId = device_id;
    if (category_id) productFilter.categoryId = category_id;

    // Find merchant_products that match, with merchant and product info
    const merchantProducts = await prisma.merchantProduct.findMany({
      where: {
        isActive: true,
        product: productFilter,
        merchant: { status: 'active' },
      },
      include: {
        merchant: true,
        product: { include: { category: true, device: { include: { brand: true } } } },
      },
    });

    // Calculate distance and filter by radius
    const results = [];
    for (const mp of merchantProducts) {
      const m = mp.merchant;
      const distance = haversineDistance(
        userLat, userLng,
        parseFloat(m.latitude), parseFloat(m.longitude)
      );

      if (distance <= maxRadius) {
        results.push({
          merchant: {
            id: m.id,
            slug: m.slug,
            name: m.name,
            address: m.address,
            city: m.city,
            county: m.county,
            ratingAvg: parseFloat(m.ratingAvg),
            ratingCount: m.ratingCount,
            logoUrl: m.logoUrl,
          },
          service: {
            merchantProductId: mp.id,
            productId: mp.product.id,
            name: mp.product.name,
            category: mp.product.category.name,
            brand: mp.product.device.brand.name,
            device: mp.product.device.name,
          },
          price: parseFloat(mp.myPrice),
          distanceKm: Math.round(distance * 10) / 10,
          inStock: mp.inStock,
        });
      }
    }

    // Sort by distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
