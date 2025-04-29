import { prisma } from "@/lib/prisma";
import { test, expect, describe, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    users: {
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
      password: "password",
    };

    (prisma.users.create as any).mockResolvedValue(mockUser);

    const user = await prisma.users.create({
      data: mockUser,
    });

    expect(user).toEqual(mockUser);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("password");
  });
});
