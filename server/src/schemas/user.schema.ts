import { z } from "zod";

const firstLetterLower = (val: unknown) =>
  typeof val === "string" && val.length > 0
    ? val.charAt(0).toLowerCase() + val.slice(1)
    : val;

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  name: z.string().transform((val) => firstLetterLower(val) as string),
  role: z.enum(["USER", "ADMIN", "COLLABORATOR"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(["USER", "ADMIN", "COLLABORATOR"]),
  phone: z.string().nullable(),
});

export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserInput = z.infer<typeof loginSchema>;

export const loginUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(["USER", "ADMIN", "COLLABORATOR"]),
  establishment_id: z.string().nullable().optional(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: loginUserSchema,
});

export const createUserSchemaResponse = {
  schema: {
    tags: ["user"],
    description: "Create a new user",
    body: createUserSchema,
  },
};

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "Envie ao menos um campo: name ou email",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
