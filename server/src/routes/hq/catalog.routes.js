import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

// All HQ catalog routes require admin auth
router.use(authenticate);
router.use(requireRole('hq_admin'));

// GET /catalog — list master products with pagination and search
router.get('/catalog', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.masterProduct.findMany({
        where,
        skip,
        take: limit,
        include: { device: { include: { brand: true } }, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.masterProduct.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get catalog error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /catalog — create master product
router.post('/catalog', async (req, res) => {
  try {
    const { sku, name, deviceId, categoryId, baseCost, suggestedPrice, description, imageUrl, estimatedTime, warrantyDays } = req.body;

    if (!sku || !name || !deviceId || !categoryId || baseCost == null || suggestedPrice == null) {
      return res.status(400).json({ error: 'Missing required fields: sku, name, deviceId, categoryId, baseCost, suggestedPrice' });
    }

    const product = await prisma.masterProduct.create({
      data: {
        sku,
        name,
        deviceId,
        categoryId,
        baseCost,
        suggestedPrice,
        description: description || null,
        imageUrl: imageUrl || null,
        estimatedTime: estimatedTime || null,
        warrantyDays: warrantyDays || 180,
      },
      include: { device: { include: { brand: true } }, category: true },
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /catalog/:id — update product
router.patch('/catalog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, deviceId, categoryId, baseCost, suggestedPrice, description, imageUrl, estimatedTime, warrantyDays, isActive } = req.body;

    const data = {};
    if (sku !== undefined) data.sku = sku;
    if (name !== undefined) data.name = name;
    if (deviceId !== undefined) data.deviceId = deviceId;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (baseCost !== undefined) data.baseCost = baseCost;
    if (suggestedPrice !== undefined) data.suggestedPrice = suggestedPrice;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (estimatedTime !== undefined) data.estimatedTime = estimatedTime;
    if (warrantyDays !== undefined) data.warrantyDays = warrantyDays;
    if (isActive !== undefined) data.isActive = isActive;

    const product = await prisma.masterProduct.update({
      where: { id },
      data,
      include: { device: { include: { brand: true } }, category: true },
    });

    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /catalog/:id — soft delete (set isActive=false)
router.delete('/catalog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.masterProduct.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Product deactivated' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /brands — list all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await prisma.masterBrand.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(brands);
  } catch (err) {
    console.error('Get brands error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /brands — create brand
router.post('/brands', async (req, res) => {
  try {
    const { name, logoUrl, sortOrder } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const brand = await prisma.masterBrand.create({
      data: { name, logoUrl: logoUrl || null, sortOrder: sortOrder || 0 },
    });

    res.status(201).json(brand);
  } catch (err) {
    console.error('Create brand error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /devices — list all devices with brand
router.get('/devices', async (req, res) => {
  try {
    const devices = await prisma.masterDevice.findMany({
      include: { brand: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(devices);
  } catch (err) {
    console.error('Get devices error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /devices — create device
router.post('/devices', async (req, res) => {
  try {
    const { brandId, name, imageUrl, sortOrder } = req.body;
    if (!brandId || !name) {
      return res.status(400).json({ error: 'brandId and name are required' });
    }

    const device = await prisma.masterDevice.create({
      data: { brandId, name, imageUrl: imageUrl || null, sortOrder: sortOrder || 0 },
      include: { brand: true },
    });

    res.status(201).json(device);
  } catch (err) {
    console.error('Create device error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /categories — list all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.masterCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /categories — create category
router.post('/categories', async (req, res) => {
  try {
    const { name, icon, sortOrder } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await prisma.masterCategory.create({
      data: { name, icon: icon || null, sortOrder: sortOrder || 0 },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
