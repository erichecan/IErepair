import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('hq_admin'));

// GET /commission/rules — list all rules
router.get('/commission/rules', async (req, res) => {
  try {
    const rules = await prisma.commissionRule.findMany({
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(rules);
  } catch (err) {
    console.error('Get commission rules error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /commission/rules — create rule
router.post('/commission/rules', async (req, res) => {
  try {
    const { name, rate, scopeType, scopeValue, startDate, endDate, priority } = req.body;

    if (!name || rate == null || !scopeType || !startDate) {
      return res.status(400).json({ error: 'Missing required fields: name, rate, scopeType, startDate' });
    }

    const rule = await prisma.commissionRule.create({
      data: {
        name,
        rate,
        scopeType,
        scopeValue: scopeValue || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        priority: priority || 0,
        createdById: req.user.id,
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(rule);
  } catch (err) {
    console.error('Create commission rule error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /commission/rules/:id — update rule
router.patch('/commission/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rate, scopeType, scopeValue, startDate, endDate, priority, isActive } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (rate !== undefined) data.rate = rate;
    if (scopeType !== undefined) data.scopeType = scopeType;
    if (scopeValue !== undefined) data.scopeValue = scopeValue;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (priority !== undefined) data.priority = priority;
    if (isActive !== undefined) data.isActive = isActive;

    const rule = await prisma.commissionRule.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    res.json(rule);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Commission rule not found' });
    }
    console.error('Update commission rule error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /commission/rules/:id — soft delete
router.delete('/commission/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.commissionRule.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Commission rule deactivated' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Commission rule not found' });
    }
    console.error('Delete commission rule error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
