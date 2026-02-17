import { z } from "zod";

export const registerCollaboratorSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  phone: z.string({ required_error: "Phone is required" }),
  email: z.string({ required_error: "Email is required" }).email(),
  avatar: z.string().optional(),
  establishment_id: z.string({
    required_error: "Establishment id is required",
  }),
});

export const updateCollaboratorSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  role: z.enum(["ADMIN", "COLLABORATOR"]).optional(),
  establishment_id: z.string().uuid().optional().nullable(),
});
