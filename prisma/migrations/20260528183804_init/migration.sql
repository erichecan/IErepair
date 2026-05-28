-- CreateTable
CREATE TABLE "DeviceCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "year" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairService" (
    "id" SERIAL NOT NULL,
    "deviceModelId" INTEGER NOT NULL,
    "repairTypeId" INTEGER NOT NULL,
    "basePriceMin" DECIMAL(10,2) NOT NULL,
    "basePriceMax" DECIMAL(10,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCategory_name_key" ON "DeviceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCategory_nameEn_key" ON "DeviceCategory"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCategory_slug_key" ON "DeviceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceBrand_categoryId_slug_key" ON "DeviceBrand"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceModel_brandId_name_key" ON "DeviceModel"("brandId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RepairType_categoryId_nameEn_key" ON "RepairType"("categoryId", "nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "RepairService_deviceModelId_repairTypeId_key" ON "RepairService"("deviceModelId", "repairTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "DeviceBrand" ADD CONSTRAINT "DeviceBrand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DeviceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceModel" ADD CONSTRAINT "DeviceModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "DeviceBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairType" ADD CONSTRAINT "RepairType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DeviceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairService" ADD CONSTRAINT "RepairService_deviceModelId_fkey" FOREIGN KEY ("deviceModelId") REFERENCES "DeviceModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairService" ADD CONSTRAINT "RepairService_repairTypeId_fkey" FOREIGN KEY ("repairTypeId") REFERENCES "RepairType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
