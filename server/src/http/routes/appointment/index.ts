import z from "zod";
import { getAppointmentsQuerySchema } from "@/schemas/appointment.schema";
import { FastifyTypedInstance } from "@/types";

import {
  createAppointment,
  getAppointmentById,
  getAppointments,
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
