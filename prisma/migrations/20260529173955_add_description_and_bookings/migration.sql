-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "RepairBooking" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "repairServiceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_confirm',
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "userEmail" TEXT,
    "appointmentTime" TIMESTAMP(3) NOT NULL,
    "quotedPrice" DECIMAL(10,2) NOT NULL,
    "actualPrice" DECIMAL(10,2),
    "notes" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairBooking_orderNumber_key" ON "RepairBooking"("orderNumber");

-- CreateIndex
CREATE INDEX "RepairBooking_merchantId_idx" ON "RepairBooking"("merchantId");

-- CreateIndex
CREATE INDEX "RepairBooking_status_idx" ON "RepairBooking"("status");

-- CreateIndex
CREATE INDEX "RepairBooking_appointmentTime_idx" ON "RepairBooking"("appointmentTime");

-- AddForeignKey
ALTER TABLE "RepairBooking" ADD CONSTRAINT "RepairBooking_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairBooking" ADD CONSTRAINT "RepairBooking_repairServiceId_fkey" FOREIGN KEY ("repairServiceId") REFERENCES "RepairService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
