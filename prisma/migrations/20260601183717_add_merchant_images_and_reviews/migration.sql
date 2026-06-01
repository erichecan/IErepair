-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "images" TEXT[];

-- CreateTable
CREATE TABLE "MerchantReview" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantReview_bookingId_key" ON "MerchantReview"("bookingId");

-- CreateIndex
CREATE INDEX "MerchantReview_merchantId_idx" ON "MerchantReview"("merchantId");

-- AddForeignKey
ALTER TABLE "MerchantReview" ADD CONSTRAINT "MerchantReview_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantReview" ADD CONSTRAINT "MerchantReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RepairBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
