import { prisma } from "@/lib/prisma";
import { getMerchantSession } from "@/lib/merchant-auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function MerchantDashboard() {
  const session = await getMerchantSession();
  if (!session) redirect("/merchant/login");

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: { name: true, mustChangePassword: true, eircode: true },
  });

  if (merchant?.mustChangePassword) redirect("/merchant/change-password");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [productCount, serviceCount, hoursCount, todayBookings, pendingBookings, recentBookings] = await Promise.all([
    prisma.merchantProduct.count({ where: { merchantId: session.merchantId, isActive: true } }),
    prisma.merchantService.count({ where: { merchantId: session.merchantId, isActive: true } }),
    prisma.merchantHours.count({ where: { merchantId: session.merchantId, isClosed: false } }),
    prisma.repairBooking.count({
      where: { merchantId: session.merchantId, appointmentTime: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.repairBooking.count({
      where: { merchantId: session.merchantId, status: "pending_confirm" },
    }),
    prisma.repairBooking.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { repairService: { include: { deviceModel: { include: { brand: true } }, repairType: true } } },
    }),
  ]);

  return (
    <DashboardClient
      merchantName={merchant?.name ?? ""}
      eircode={merchant?.eircode ?? null}
      hoursCount={hoursCount}
      productCount={productCount}
      serviceCount={serviceCount}
      todayBookings={todayBookings}
      pendingBookings={pendingBookings}
      recentBookings={recentBookings.map(b => ({
        id: b.id,
        orderNumber: b.orderNumber,
        status: b.status,
        userName: b.userName,
        repairService: {
          deviceModel: {
            name: b.repairService.deviceModel.name,
            brand: { name: b.repairService.deviceModel.brand.name },
          },
          repairType: { name: b.repairService.repairType.name },
        },
      }))}
    />
  );
}
