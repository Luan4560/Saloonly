import { Status, WorkingDaysEnum } from "@/lib/prisma";
import z from "zod";

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

export const appointmentSchema = z.object({
  user_id: z.string().uuid().optional(),
  establishment_id: z.string().uuid(),
  collaborator_id: z.string().uuid(),
  service_id: z.string().uuid(),
  appointment_date: z.coerce.date().optional(),
  workingDays: z
    .array(workingDaySchema)
    .min(1, "At least one working day is required"),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(Status),
});

export const getAppointmentsQuerySchema = z.object({
  status: z.nativeEnum(Status).optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  establishment_id: z.string().uuid().optional(),
});
