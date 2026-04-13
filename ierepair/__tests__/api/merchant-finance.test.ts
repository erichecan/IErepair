import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth before importing route
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { GET } from "@/app/api/v1/merchant/finance/route";
import { NextRequest } from "next/server";

function makeRequest(month?: string) {
  const url = month
    ? `http://localhost/api/v1/merchant/finance?month=${month}`
    : "http://localhost/api/v1/merchant/finance";
  return new NextRequest(url);
}

describe("GET /api/v1/merchant/finance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 401 when role is not merchant", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: "admin", merchantId: null } } as never);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 when month param format is invalid", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "merchant", merchantId: "m1" },
    } as never);
    const res = await GET(makeRequest("not-a-month"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/invalid month/i);
  });
});
