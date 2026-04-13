import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const orderByStep = {
    orderBy: vi.fn().mockResolvedValue([]),
  };
  const groupByStep = {
    groupBy: vi.fn().mockReturnValue(orderByStep),
  };
  const whereAfterJoin = {
    where: vi.fn().mockReturnValue(groupByStep),
  };
  const leftJoinStep = {
    leftJoin: vi.fn().mockReturnValue(whereAfterJoin),
    where: vi.fn().mockResolvedValue([]),
  };
  const fromStep = {
    from: vi.fn().mockReturnValue(leftJoinStep),
  };
  return {
    db: {
      select: vi.fn().mockReturnValue(fromStep),
    },
  };
});

import { auth } from "@/lib/auth";
import { GET } from "@/app/api/v1/admin/finance/route";
import { NextRequest } from "next/server";

function makeRequest(month?: string) {
  const url = month
    ? `http://localhost/api/v1/admin/finance?month=${month}`
    : "http://localhost/api/v1/admin/finance";
  return new NextRequest(url);
}

describe("GET /api/v1/admin/finance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 403 when role is merchant (not admin)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "merchant", merchantId: "m1" },
    } as never);
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid month format", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "admin" },
    } as never);
    const res = await GET(makeRequest("2026/04"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid month/i);
  });

  it("returns 200 with zeros when no ledger entries exist", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "admin" },
    } as never);

    const res = await GET(makeRequest("2026-04"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      month: "2026-04",
      totalRepairRevenue: expect.any(String),
      totalCommission: expect.any(String),
      totalNetToMerchants: expect.any(String),
      completedBookings: expect.any(Number),
      merchants: expect.any(Array),
    });
  });
});
