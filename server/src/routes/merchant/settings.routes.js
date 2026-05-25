import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('merchant'));

// GET /settings — return merchant profile
router.get('/settings', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.user.id },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        businessHours: { orderBy: { dayOfWeek: 'asc' } },
        bookingSlot: true,
      },
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const { passwordHash, ...profile } = merchant;
    res.json(profile);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /settings — update merchant fields
router.patch('/settings', async (req, res) => {
  try {
    const { name, address, city, county, eircode, latitude, longitude, description, phone, logoUrl, coverPhotoUrl } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (county !== undefined) data.county = county;
    if (eircode !== undefined) data.eircode = eircode;
    if (latitude !== undefined) data.latitude = latitude;
    if (longitude !== undefined) data.longitude = longitude;
    if (description !== undefined) data.description = description;
    if (phone !== undefined) data.phone = phone;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;
    if (coverPhotoUrl !== undefined) data.coverPhotoUrl = coverPhotoUrl;

    const merchant = await prisma.merchant.update({
      where: { id: req.user.id },
      data,
    });

    const { passwordHash, ...profile } = merchant;
    res.json(profile);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /settings/hours — replace all business hours
router.put('/settings/hours', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { hours } = req.body;

    if (!Array.isArray(hours)) {
      return res.status(400).json({ error: 'hours array is required' });
    }

    // Delete existing hours and recreate
    await prisma.merchantBusinessHour.deleteMany({ where: { merchantId } });

    const created = await Promise.all(
      hours.map((h) =>
        prisma.merchantBusinessHour.create({
          data: {
            merchantId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime || null,
            closeTime: h.closeTime || null,
            isClosed: h.isClosed || false,
          },
        })
      )
    );

    res.json(created);
  } catch (err) {
    console.error('Update hours error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /settings/slots — update booking slot config
router.patch('/settings/slots', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { slotDuration, maxConcurrent, bufferMinutes, advanceDays } = req.body;

    const data = {};
    if (slotDuration !== undefined) data.slotDuration = slotDuration;
    if (maxConcurrent !== undefined) data.maxConcurrent = maxConcurrent;
    if (bufferMinutes !== undefined) data.bufferMinutes = bufferMinutes;
    if (advanceDays !== undefined) data.advanceDays = advanceDays;

    const slot = await prisma.merchantBookingSlot.upsert({
      where: { merchantId },
      create: { merchantId, ...data },
      update: data,
    });

    res.json(slot);
  } catch (err) {
    console.error('Update slots error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /settings/photos — add photo URL
router.post('/settings/photos', async (req, res) => {
  try {
    const { url, sortOrder } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const photo = await prisma.merchantPhoto.create({
      data: {
        merchantId: req.user.id,
        url,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json(photo);
  } catch (err) {
    console.error('Add photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /settings/photos/:id — remove photo
router.delete('/settings/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await prisma.merchantPhoto.findUnique({ where: { id } });
    if (!photo || photo.merchantId !== req.user.id) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    await prisma.merchantPhoto.delete({ where: { id } });

    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
