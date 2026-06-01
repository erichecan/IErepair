import { prisma } from "@/lib/prisma";
import { getMerchantSession } from "@/lib/merchant-auth";

export async function PATCH(req: Request) {
  const session = await getMerchantSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as {
      stripePublishableKey?: string;
      stripeSecretKey?: string;
    };

    const updateData: { stripePublishableKey?: string; stripeSecretKey?: string } = {};

    if (body.stripePublishableKey !== undefined) {
      const key = body.stripePublishableKey.trim();
      if (key && !key.startsWith("pk_")) {
        return Response.json({ error: "Publishable key must start with pk_" }, { status: 400 });
      }
      updateData.stripePublishableKey = key || undefined;
    }

    if (body.stripeSecretKey !== undefined) {
      const key = body.stripeSecretKey.trim();
      if (key && !key.startsWith("sk_")) {
        return Response.json({ error: "Secret key must start with sk_" }, { status: 400 });
      }
      updateData.stripeSecretKey = key || undefined;
    }

    await prisma.merchant.update({
      where: { id: session.merchantId },
      data: updateData,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[Merchant Stripe PATCH Error]", error);
    return Response.json({ error: "Failed to save Stripe settings" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getMerchantSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: session.merchantId },
      select: { stripePublishableKey: true, stripeSecretKey: true },
    });

    return Response.json({
      configured: !!merchant?.stripePublishableKey && !!merchant?.stripeSecretKey,
      publishableKey: merchant?.stripePublishableKey ?? null,
    });
  } catch (error) {
    console.error("[Merchant Stripe GET Error]", error);
    return Response.json({ error: "Failed to fetch Stripe settings" }, { status: 500 });
  }
}
