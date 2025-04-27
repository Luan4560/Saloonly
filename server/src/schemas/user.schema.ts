import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  role: z.enum(["USER", "ADMIN", "COLLABORATOR"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserInput = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
});
