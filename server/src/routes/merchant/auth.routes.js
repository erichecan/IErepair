import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const merchant = await prisma.merchant.findUnique({ where: { email } });
    if (!merchant) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, merchant.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (merchant.status !== 'active') {
      return res.status(403).json({ error: `Account is ${merchant.status}. Please contact support.` });
    }

    const token = jwt.sign(
      { id: merchant.id, role: 'merchant' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
        slug: merchant.slug,
        role: 'merchant',
      },
    });
  } catch (err) {
    console.error('Merchant login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me — current merchant profile
router.get('/me', authenticate, requireRole('merchant'), async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.user.id },
      include: {
        photos: true,
        businessHours: { orderBy: { dayOfWeek: 'asc' } },
        bookingSlot: true,
      },
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Remove password hash from response
    const { passwordHash, ...profile } = merchant;
    res.json(profile);
  } catch (err) {
    console.error('Get merchant profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
