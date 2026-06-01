import { prisma } from "@/lib/prisma";
import { getMerchantSession } from "@/lib/merchant-auth";
import { redirect } from "next/navigation";
import MerchantSettingsClient from "./SettingsClient";

export default async function MerchantSettingsPage() {
  const session = await getMerchantSession();
  if (!session) redirect("/merchant/login");

  const [merchant, hours] = await Promise.all([
    prisma.merchant.findUnique({
      where: { id: session.merchantId },
      select: { id: true, name: true, email: true, phone: true, address: true, eircode: true, description: true, images: true, lat: true, lng: true, stripePublishableKey: true, stripeSecretKey: true },
    }),
    prisma.merchantHours.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  if (!merchant) redirect("/merchant/login");

  return <MerchantSettingsClient merchant={merchant} hours={hours} initialImages={merchant.images} stripeConfigured={!!merchant.stripePublishableKey && !!merchant.stripeSecretKey} />;
}
