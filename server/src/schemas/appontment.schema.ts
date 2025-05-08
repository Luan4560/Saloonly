import z from "zod";

export const createAppointmentSchema = z.object({
  user_id: z.string().uuid(),
  collaborator_id: z.string().uuid(),
  establishment_id: z.string().uuid(),
  service_id: z.string().uuid(),
  appointment_date: z
    .string()
    .refine(
      (date: string) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      },
      {
        message:
          "Invalid datetime format. Expected format: '2024-03-20T14:30:00Z'",
      }
    )
    .transform((date: string) => new Date(date).toISOString()),
});
