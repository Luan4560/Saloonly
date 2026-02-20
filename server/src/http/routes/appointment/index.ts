import z from "zod";
import { FastifyTypedInstance } from "@/types";
import {
  getAppointmentsQuerySchema,
  getAvailableSlotsQuerySchema,
  getAvailableSlotsResponseSchema,
} from "@/schemas/appointment.schema";

import {
  createAppointment,
  getAppointmentById,
  getAppointments,
  getAvailableSlots,
  updateAppointmentStatus,
} from "@/http/controllers/appointment.controller";

export async function appointmentRoutes(app: FastifyTypedInstance) {
  app.post("/register", { preHandler: [app.authenticate] }, createAppointment);

  app.get(
    "/list",
    {
      preHandler: [app.authenticate],
      schema: { querystring: getAppointmentsQuerySchema },
    },
    getAppointments,
  );

  app.get(
    "/available-slots",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Appointment"],
        description:
          "List available time slots for an establishment on a date (optionally filtered by collaborator)",
        querystring: getAvailableSlotsQuerySchema,
        response: { 200: getAvailableSlotsResponseSchema },
      },
    },
    getAvailableSlots,
  );

  app.get(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
        tags: ["Appointment"],
        description: "Get a single appointment by id",
      },
    },
    getAppointmentById,
  );

  app.patch(
    "/:id/status",
    { preHandler: [app.authenticate] },
    updateAppointmentStatus,
  );
}
