import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { verifyClaim, calculateSettlement } from '../../services/warranty.service.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('merchant'));

// GET /warranty-claims — list claims involving this merchant
router.get('/warranty-claims', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { claimingMerchantId: merchantId },
        { originalMerchantId: merchantId },
      ],
    };

    const [claims, total] = await Promise.all([
      prisma.warrantyClaim.findMany({
        where,
        skip,
        take: limit,
        include: {
          warranty: {
            include: {
              customer: { select: { id: true, name: true } },
              product: true,
            },
          },
          claimingMerchant: { select: { id: true, name: true } },
          originalMerchant: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warrantyClaim.count({ where }),
    ]);

    res.json({
      data: claims,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get warranty claims error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /warranty-claims — create claim
router.post('/warranty-claims', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { warrantyNumber, customerNote } = req.body;

    if (!warrantyNumber) {
      return res.status(400).json({ error: 'warrantyNumber is required' });
    }

    // Verify the warranty is valid
    const warranty = await verifyClaim(warrantyNumber);

    // Calculate settlement
    const settlement = await calculateSettlement(warranty);

    // Create the claim
    const claim = await prisma.warrantyClaim.create({
      data: {
        warrantyId: warranty.id,
        claimingMerchantId: merchantId,
        originalMerchantId: warranty.originalMerchantId,
        partCost: settlement.partCost,
        laborSubsidy: settlement.laborSubsidy,
        totalCompensation: settlement.totalCompensation,
        status: 'pending',
        customerNote: customerNote || null,
      },
      include: {
        warranty: true,
        claimingMerchant: { select: { id: true, name: true } },
        originalMerchant: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(claim);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
