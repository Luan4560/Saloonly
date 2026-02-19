import { prisma } from "@/lib/prisma";
import { test, expect, describe, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("User Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("It should be able to create a new user", async () => {
    const mockUser = {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "USER" as const,
      phone: null as string | null,
    };

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue(mockUser);

    const user = await prisma.user.create({
      data: {
        password: "hashed",
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    });

    expect(user).toEqual(mockUser);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("role");
    expect(user).toHaveProperty("phone");
    expect(user).not.toHaveProperty("password");
  });
});
