import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

// In-memory OTP store for MVP (phone -> { code, expiresAt })
const otpStore = new Map();

// POST /send-otp — generate a 6-digit OTP and log it
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    // For MVP, just log it (no real SMS)
    console.log(`[OTP] Phone: ${phone}, Code: ${code}`);

    res.json({ message: 'OTP sent', phone });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /verify-otp — verify code, find or create customer, return JWT
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code, name, email } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    // For MVP, accept any 6-digit code or verify against stored OTP
    const stored = otpStore.get(phone);
    const isValid = stored && stored.code === code && stored.expiresAt > Date.now();

    // For development convenience, also accept "000000" as a bypass code
    if (!isValid && code !== '000000') {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear the used OTP
    otpStore.delete(phone);

    // Find or create customer
    let customer = await prisma.customer.findFirst({ where: { phone } });

    if (!customer) {
      // Need at minimum a name and email to create
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required for new customers' });
      }

      customer = await prisma.customer.create({
        data: {
          phone,
          name,
          email,
          passwordHash: '', // OTP-based auth, no password needed
        },
      });
    }

    const token = jwt.sign(
      { id: customer.id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'customer',
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me — return current customer (requires auth)
router.get('/me', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error('Get customer profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
