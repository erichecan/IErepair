import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('merchant'));

// GET /catalog — list all master products with merchant's overlay
router.get('/catalog', async (req, res) => {
  try {
    const merchantId = req.user.id;

    const products = await prisma.masterProduct.findMany({
      where: { isActive: true },
      include: {
        device: { include: { brand: true } },
        category: true,
        merchantProducts: {
          where: { merchantId },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Overlay merchant-specific data
    const result = products.map((product) => {
      const mp = product.merchantProducts[0] || null;
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        baseCost: parseFloat(product.baseCost),
        suggestedPrice: parseFloat(product.suggestedPrice),
        imageUrl: product.imageUrl,
        estimatedTime: product.estimatedTime,
        warrantyDays: product.warrantyDays,
        device: product.device,
        category: product.category,
        // Merchant overlay
        merchantProduct: mp
          ? {
              id: mp.id,
              myPrice: parseFloat(mp.myPrice),
              isActive: mp.isActive,
              inStock: mp.inStock,
            }
          : null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Get merchant catalog error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /catalog/sync — upsert a single merchant_product
router.post('/catalog/sync', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { productId, myPrice, isActive } = req.body;

    if (!productId || myPrice == null) {
      return res.status(400).json({ error: 'productId and myPrice are required' });
    }

    // Verify product exists
    const product = await prisma.masterProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const merchantProduct = await prisma.merchantProduct.upsert({
      where: {
        merchantId_productId: { merchantId, productId },
      },
      create: {
        merchantId,
        productId,
        myPrice,
        isActive: isActive !== undefined ? isActive : true,
      },
      update: {
        myPrice,
        ...(isActive !== undefined && { isActive }),
      },
      include: { product: true },
    });

    res.json(merchantProduct);
  } catch (err) {
    console.error('Sync catalog error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /catalog/:id — update merchant_product
router.patch('/catalog/:id', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;
    const { myPrice, isActive, inStock } = req.body;

    // Verify ownership
    const existing = await prisma.merchantProduct.findUnique({ where: { id } });
    if (!existing || existing.merchantId !== merchantId) {
      return res.status(404).json({ error: 'Merchant product not found' });
    }

    const data = {};
    if (myPrice !== undefined) data.myPrice = myPrice;
    if (isActive !== undefined) data.isActive = isActive;
    if (inStock !== undefined) data.inStock = inStock;

    const updated = await prisma.merchantProduct.update({
      where: { id },
      data,
      include: { product: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update merchant product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /catalog/bulk-sync — batch upsert multiple merchant_products
router.post('/catalog/bulk-sync', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    const results = [];
    for (const item of items) {
      const { productId, myPrice, isActive } = item;
      if (!productId || myPrice == null) continue;

      const mp = await prisma.merchantProduct.upsert({
        where: {
          merchantId_productId: { merchantId, productId },
        },
        create: {
          merchantId,
          productId,
          myPrice,
          isActive: isActive !== undefined ? isActive : true,
        },
        update: {
          myPrice,
          ...(isActive !== undefined && { isActive }),
        },
      });
      results.push(mp);
    }

    res.json({ synced: results.length, items: results });
  } catch (err) {
    console.error('Bulk sync error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
