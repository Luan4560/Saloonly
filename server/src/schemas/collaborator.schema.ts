import { Specialities } from "@prisma/client";
import { z } from "zod";

export const registerCollaboratorSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  phone: z.string({ required_error: "Phone is required" }),
  email: z.string({ required_error: "Email is required" }),
  specialities: z.array(z.nativeEnum(Specialities), {
    required_error: "Specialties is required",
  }),
  avatar: z.string().optional(),
  establishment_id: z.string({
    required_error: "Establishment id is required",
  }),
});
