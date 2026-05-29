-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "MerchantProduct" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantService" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "repairServiceId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantHours" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MerchantHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantProduct_merchantId_idx" ON "MerchantProduct"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantProduct_productId_idx" ON "MerchantProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantProduct_merchantId_productId_key" ON "MerchantProduct"("merchantId", "productId");

-- CreateIndex
CREATE INDEX "MerchantService_merchantId_idx" ON "MerchantService"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantService_repairServiceId_idx" ON "MerchantService"("repairServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantService_merchantId_repairServiceId_key" ON "MerchantService"("merchantId", "repairServiceId");

-- CreateIndex
CREATE INDEX "MerchantHours_merchantId_idx" ON "MerchantHours"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantHours_merchantId_dayOfWeek_key" ON "MerchantHours"("merchantId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "MerchantProduct" ADD CONSTRAINT "MerchantProduct_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantProduct" ADD CONSTRAINT "MerchantProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantService" ADD CONSTRAINT "MerchantService_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantService" ADD CONSTRAINT "MerchantService_repairServiceId_fkey" FOREIGN KEY ("repairServiceId") REFERENCES "RepairService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantHours" ADD CONSTRAINT "MerchantHours_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
