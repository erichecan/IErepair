import prisma from '../config/database.js';
import crypto from 'crypto';

/**
 * Generate a warranty number in the format IRA-W-YYYYMMDD-XXXX
 */
function generateWarrantyNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `IRA-W-${date}-${rand}`;
}

/**
 * Create a warranty record for a completed booking. Warranty is valid for 180 days.
 */
export async function createWarranty(booking) {
  const warrantyNumber = generateWarrantyNumber();
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (booking.merchantProduct?.product?.warrantyDays || 180));

  const warranty = await prisma.warranty.create({
    data: {
      warrantyNumber,
      bookingId: booking.id,
      customerId: booking.customerId,
      originalMerchantId: booking.merchantId,
      productId: booking.merchantProduct?.productId || booking.merchantProduct?.product?.id,
      deviceName: booking.merchantProduct?.product?.device?.name || booking.serviceName,
      serviceName: booking.serviceName,
      startDate,
      endDate,
      status: 'active',
    },
  });

  return warranty;
}

/**
 * Verify a warranty claim by warranty number.
 * Checks that the warranty exists, is active, and not expired.
 */
export async function verifyClaim(warrantyNumber) {
  const warranty = await prisma.warranty.findUnique({
    where: { warrantyNumber },
    include: {
      booking: true,
      customer: true,
      originalMerchant: true,
      product: true,
    },
  });

  if (!warranty) {
    throw Object.assign(new Error('Warranty not found'), { status: 404 });
  }

  if (warranty.status !== 'active') {
    throw Object.assign(new Error('Warranty is not active'), { status: 400 });
  }

  const now = new Date();
  if (now > new Date(warranty.endDate)) {
    throw Object.assign(new Error('Warranty has expired'), { status: 400 });
  }

  return warranty;
}

/**
 * Calculate settlement for a warranty claim.
 * Settlement = baseCost of the product + EUR 30 labor subsidy.
 */
export async function calculateSettlement(warranty) {
  const product = warranty.product || await prisma.masterProduct.findUnique({
    where: { id: warranty.productId },
  });

  if (!product) {
    throw Object.assign(new Error('Product not found'), { status: 404 });
  }

  const baseCost = parseFloat(product.baseCost);
  const laborSubsidy = 30;
  const totalCompensation = baseCost + laborSubsidy;

  return {
    partCost: baseCost,
    laborSubsidy,
    totalCompensation,
  };
}
