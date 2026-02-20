import { z } from "zod";
import { WorkingDaysEnum } from "@/lib/prisma";

const firstLetterLower = (val: unknown) =>
  typeof val === "string" && val.length > 0
    ? val.charAt(0).toLowerCase() + val.slice(1)
    : val;

const workingDaySchema = z.object({
  day_of_week: z.nativeEnum(WorkingDaysEnum),
  open_time: z.string().transform((val) => firstLetterLower(val) as string),
  close_time: z.string().transform((val) => firstLetterLower(val) as string),
  appointment_date: z.coerce.date().refine(
    (d) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const day = d.getUTCDate();
      const appointmentCivil = new Date(y, m, day);
      return appointmentCivil >= today;
    },
    { message: "Não é possível agendar em data passada." },
  ),
});

export const clientBookingSchema = z.object({
  establishment_id: z.string().uuid(),
  collaborator_id: z.string().uuid(),
  service_ids: z
    .array(z.string().uuid())
    .min(1, "Pelo menos um serviço é obrigatório"),
  workingDays: z
    .array(workingDaySchema)
    .min(1, "At least one working day is required"),
  guest_name: z.string().min(1).optional(),
  guest_email: z.string().email().optional(),
  guest_phone: z.string().min(1).optional(),
});

export type ClientBookingInput = z.infer<typeof clientBookingSchema>;

export const clientRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  name: z.string().min(1).transform((val) => firstLetterLower(val) as string),
});

export type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;

export const clientRegisterResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.literal("USER"),
  phone: z.string().nullable(),
});

export type ClientRegisterResponse = z.infer<typeof clientRegisterResponseSchema>;

export const clientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type ClientLoginInput = z.infer<typeof clientLoginSchema>;

export const clientUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.literal("USER"),
  establishment_id: z.string().nullable().optional(),
});

export const clientLoginResponseSchema = z.object({
  accessToken: z.string(),
  user: clientUserSchema,
});
