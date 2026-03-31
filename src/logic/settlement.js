/**
 * The "Secret Sauce": Cross-Shop Warranty Settlement Logic
 * 
 * Logic:
 * If Shop A repairs, and Shop B performs the warranty service:
 * 1. Platform deducts (Part Base Cost + Labor Subsidy) from Shop A's balance.
 * 2. Platform adds that amount to Shop B's "Compensation Pool".
 */

export const LABOR_SUBSIDY = 30; // 30 EUR fixed labor subsidy for warranty service

export function calculateSettlement(originalRepair, masterCatalog) {
  const part = masterCatalog.find(p => p.id === originalRepair.itemId);
  if (!part) throw new Error("Item not found in Master Catalog");

  const compensation = part.baseCost + LABOR_SUBSIDY;

  return {
    originalShopId: originalRepair.shopId,
    servicingShopId: originalRepair.servicingShopId,
    compAmount: compensation,
    breakdown: {
      partCost: part.baseCost,
      laborSubsidy: LABOR_SUBSIDY
    },
    currency: 'EUR'
  };
}

export function generateWarrantyId(orderId, shopId) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `IRA-${shopId.split('-')[1].toUpperCase()}-${orderId.substring(0, 4)}-${random}`;
}
