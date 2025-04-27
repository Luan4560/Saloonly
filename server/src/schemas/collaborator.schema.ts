import { Specialties, WorkingDays } from "@prisma/client";
import { z } from "zod";

export const registerCollaboratorSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  phone: z.string({ required_error: "Phone is required" }),
  email: z.string({ required_error: "Email is required" }),
  specialties: z.array(z.nativeEnum(Specialties), {
    required_error: "Specialties is required",
  }),
  price: z.number({ required_error: "Price is required" }),
  avatar: z.string({ required_error: "Avatar is required" }),
  role: z.enum(["ADMIN", "COLLABORATOR"], {
    required_error: "Role is required",
  }),
  establishment_id: z.string({
    required_error: "Establishment id is required",
  }),
  servicesId: z.string({ required_error: "Services id is required" }),
  working_days: z.array(
    z.nativeEnum(WorkingDays, {
      required_error: "Working days is required",
    })
  ),
  working_hours: z.array(z.string()),
});
