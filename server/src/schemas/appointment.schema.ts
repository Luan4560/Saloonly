import { WorkingDaysEnum } from "@prisma/client";
import z from "zod";

const workingDaySchema = z.object({
  day_of_week: z.nativeEnum(WorkingDaysEnum),
  open_time: z.string(),
  close_time: z.string(),
});

export const appointmentSchema = z.object({
  user_id: z.string().uuid(),
  establishment_id: z.string().uuid(),
  collaborator_id: z.string().uuid(),
  service_id: z.string().uuid(),
  workingDays: z
    .array(workingDaySchema)
    .min(1, "At least one working day is required"),
});
