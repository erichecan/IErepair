import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('hq_admin'));

// GET /finance/deposits — list deposits with date range filter
router.get('/finance/deposits', async (req, res) => {
  try {
    const { from, to } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              customer: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deposit.count({ where }),
    ]);

    res.json({
      data: deposits,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get deposits error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /finance/commissions — list commission ledger with date range
router.get('/finance/commissions', async (req, res) => {
  try {
    const { from, to } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [commissions, total] = await Promise.all([
      prisma.commissionLedger.findMany({
        where,
        skip,
        take: limit,
        include: {
          booking: true,
          merchant: { select: { id: true, name: true, email: true } },
          rule: { select: { id: true, name: true, scopeType: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.commissionLedger.count({ where }),
    ]);

    res.json({
      data: commissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get commissions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /finance/settlements — list warranty claims
router.get('/finance/settlements', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      prisma.warrantyClaim.findMany({
        skip,
        take: limit,
        include: {
          warranty: true,
          claimingMerchant: { select: { id: true, name: true, email: true } },
          originalMerchant: { select: { id: true, name: true, email: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warrantyClaim.count(),
    ]);

    res.json({
      data: claims,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get settlements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /warranty-claims — list all claims
router.get('/warranty-claims', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      prisma.warrantyClaim.findMany({
        skip,
        take: limit,
        include: {
          warranty: { include: { customer: { select: { id: true, name: true } } } },
          claimingMerchant: { select: { id: true, name: true } },
          originalMerchant: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warrantyClaim.count(),
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

// POST /warranty-claims/:id/approve
router.post('/warranty-claims/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await prisma.warrantyClaim.findUnique({ where: { id } });
    if (!claim) {
      return res.status(404).json({ error: 'Warranty claim not found' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ error: 'Claim is not in pending status' });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: req.user.id,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Approve claim error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /warranty-claims/:id/reject
router.post('/warranty-claims/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await prisma.warrantyClaim.findUnique({ where: { id } });
    if (!claim) {
      return res.status(404).json({ error: 'Warranty claim not found' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ error: 'Claim is not in pending status' });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { id },
      data: { status: 'rejected' },
    });

    res.json(updated);
  } catch (err) {
    console.error('Reject claim error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /warranty-claims/:id/settle
router.post('/warranty-claims/:id/settle', async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await prisma.warrantyClaim.findUnique({ where: { id } });
    if (!claim) {
      return res.status(404).json({ error: 'Warranty claim not found' });
    }

    if (claim.status !== 'approved') {
      return res.status(400).json({ error: 'Claim must be approved before settling' });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { id },
      data: {
        status: 'settled',
        settledAt: new Date(),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Settle claim error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
