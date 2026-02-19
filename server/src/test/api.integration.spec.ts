import { test, expect, describe, vi, beforeAll, afterAll } from "vitest";
import { app } from "@/app";

vi.mock("@/lib/prisma", async () => {
  const {
    EstablishmentType,
    Status,
    WorkingDaysEnum,
  } = await import("../generated/prisma/index.js");
  return {
    prisma: {
      $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
    EstablishmentType,
    Status,
    WorkingDaysEnum,
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
    hash: vi.fn().mockImplementation((p: string) => Promise.resolve(`hashed_${p}`)),
  },
}));

describe("API integration", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("GET /health returns 200 and database connected", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ status: "ok", database: "connected" });
  });

  test("GET /api/admin/users/me without cookie returns 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/admin/users/me",
    });
    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body).toHaveProperty("message");
  });

  test("POST /api/admin/users/login with valid body returns 201 and sets cookie", async () => {
    const { prisma } = await import("../lib/prisma.js");
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      password: "hashed_123456",
      role: "ADMIN" as const,
      phone: null,
      establishment_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockUser,
    );

    const res = await app.inject({
      method: "POST",
      url: "/api/admin/users/login",
      payload: { email: "test@example.com", password: "123456" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"]).toContain("access_token=");
    const body = res.json();
    expect(body).toHaveProperty("user");
    expect(body.user.email).toBe("test@example.com");
  });
});
