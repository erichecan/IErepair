import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "consumer") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { passwordHash: false } as never,
  });

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "consumer") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email } = body as { name?: string; email?: string };

  const [updated] = await db
    .update(users)
    .set({ ...(name && { name }), ...(email && { email }), updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id, name: users.name, email: users.email, phone: users.phone });

  return NextResponse.json({ success: true, data: updated });
}
