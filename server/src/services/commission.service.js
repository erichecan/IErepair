import prisma from '../config/database.js';

/**
 * Resolve the commission rate for a merchant.
 * Finds all active commission rules matching the merchant.
 * Priority resolution: highest priority wins. If tie, merchant > region > global.
 */
export async function resolveCommissionRate(merchantId, county, date) {
  const targetDate = date || new Date();

  // Find all active rules where the date range covers today
  const rules = await prisma.commissionRule.findMany({
    where: {
      isActive: true,
      startDate: { lte: targetDate },
      OR: [
        { endDate: null },
        { endDate: { gte: targetDate } },
      ],
    },
    orderBy: { priority: 'desc' },
  });

  if (rules.length === 0) {
    return { rate: 0, rule: null };
  }

  // Scope type priority order for tie-breaking: merchant > region > global
  const scopePriority = { merchant: 3, region: 2, global: 1 };

  // Filter rules that match this merchant
  const matchingRules = rules.filter((rule) => {
    if (rule.scopeType === 'global') return true;
    if (rule.scopeType === 'merchant' && rule.scopeValue === merchantId) return true;
    if (rule.scopeType === 'region' && county && rule.scopeValue === county) return true;
    return false;
  });

  if (matchingRules.length === 0) {
    return { rate: 0, rule: null };
  }

  // Sort by priority desc, then by scope specificity desc
  matchingRules.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return (scopePriority[b.scopeType] || 0) - (scopePriority[a.scopeType] || 0);
  });

  const bestRule = matchingRules[0];
  return { rate: parseFloat(bestRule.rate), rule: bestRule };
}

/**
 * Calculate the commission amount from a service price and rate.
 */
export function calculateCommission(servicePrice, rate) {
  return servicePrice * rate / 100;
}

/**
 * Record a commission entry in the ledger after booking completion.
 */
export async function recordCommission(bookingId, merchantId, servicePrice) {
  // Get merchant to resolve county
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  const { rate, rule } = await resolveCommissionRate(merchantId, merchant?.county, new Date());

  if (!rule || rate === 0) {
    // No commission rule applies
    return null;
  }

  const commissionAmount = calculateCommission(servicePrice, rate);

  const entry = await prisma.commissionLedger.create({
    data: {
      bookingId,
      merchantId,
      ruleId: rule.id,
      servicePrice,
      commissionRate: rate,
      commissionAmount,
      status: 'pending',
    },
  });

  return entry;
}
