import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/products";

export async function GET(_req: NextRequest) {
  const rows = await db.select().from(categories).orderBy(categories.sortOrder);
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, iconUrl, parentId, sortOrder } = body as {
    name: string; description?: string; iconUrl?: string; parentId?: string; sortOrder?: number;
  };

  if (!name) return NextResponse.json({ success: false, error: "name required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const [cat] = await db.insert(categories).values({
    name, slug, description, iconUrl, parentId, sortOrder: sortOrder ?? 0,
  }).returning();

  return NextResponse.json({ success: true, data: cat }, { status: 201 });
}
