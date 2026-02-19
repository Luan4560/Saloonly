import { prisma } from "@/lib/prisma";
import {
  appointmentSchema,
  getAppointmentsQuerySchema,
  updateAppointmentStatusSchema,
} from "@/schemas/appointment.schema";
import { doTimeSlotsOverlap } from "@/utils/time";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { Status } from "@/lib/prisma";

function toCivilDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function createAppointment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = appointmentSchema.parse(request.body);
    const { establishment_id, collaborator_id, service_id, workingDays } =
      parsed;
    const user_id = parsed.user_id ?? request.user?.id;
    if (!user_id) {
      return reply.code(400).send({
        message: "User not found or not authenticated",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return reply.code(400).send({
        message: "User not found",
      });
    }

    for (let i = 0; i < workingDays.length; i++) {
      for (let j = i + 1; j < workingDays.length; j++) {
        const a = workingDays[i];
        const b = workingDays[j];
        if (
          toCivilDateKey(a.appointment_date) !==
          toCivilDateKey(b.appointment_date)
        )
          continue;
        if (
          doTimeSlotsOverlap(
            a.open_time,
            a.close_time,
            b.open_time,
            b.close_time,
          )
        ) {
          return reply.code(409).send({
            message:
              "Não é permitido dois agendamentos no mesmo horário para o mesmo colaborador.",
          });
        }
      }
    }

    const dates = workingDays.map((d) => d.appointment_date);
    const minD = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxD = new Date(Math.max(...dates.map((d) => d.getTime())));
    const startOfMin = new Date(
      Date.UTC(
        minD.getUTCFullYear(),
        minD.getUTCMonth(),
        minD.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const endOfMax = new Date(
      Date.UTC(
        maxD.getUTCFullYear(),
        maxD.getUTCMonth(),
        maxD.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        collaborator_id,
        appointment_date: { gte: startOfMin, lte: endOfMax },
        status: { in: [Status.PENDING, Status.CONFIRMED] },
      },
      select: { appointment_date: true, open_time: true, close_time: true },
    });

    for (const day of workingDays) {
      const dayKey = toCivilDateKey(day.appointment_date);
      for (const existing of existingAppointments) {
        if (toCivilDateKey(existing.appointment_date) !== dayKey) continue;
        if (
          doTimeSlotsOverlap(
            day.open_time,
            day.close_time,
            existing.open_time,
            existing.close_time,
          )
        ) {
          return reply.code(409).send({
            message:
              "Não é permitido dois agendamentos no mesmo horário para o mesmo colaborador.",
          });
        }
      }
    }

    const appointments = await Promise.all(
      workingDays.map(async (day) => {
        return prisma.appointment.create({
          data: {
            user_id,
            establishment_id,
            collaborator_id,
            service_id,
            day_of_week: day.day_of_week,
            open_time: day.open_time,
            close_time: day.close_time,
            appointment_date: day.appointment_date,
          },
          include: {
            establishment: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                description: true,
                image: true,
                latitude: true,
                longitude: true,
              },
            },
            collaborator: true,
            service: {
              select: {
                id: true,
                description: true,
                price: true,
                duration: true,
              },
            },
          },
        });
      }),
    );

    return reply.code(201).send({
      message: "Appointments created successfully",
      appointments,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return reply.code(400).send({
        message: "Validation error",
        errors: formattedErrors,
      });
    }
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAppointments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const establishmentId =
      request.user?.establishment_id ??
      (request.query as { establishment_id?: string })?.establishment_id;
    const queryResult = getAppointmentsQuerySchema.safeParse(request.query);
    const query = queryResult.success ? queryResult.data : {};

    const where: {
      establishment_id?: string;
      status?: Status;
      appointment_date?: { gte?: Date; lte?: Date };
    } = {};
    if (establishmentId) where.establishment_id = establishmentId;
    if (query.status) where.status = query.status;
    if (query.date_from ?? query.date_to) {
      where.appointment_date = {};
      if (query.date_from) where.appointment_date.gte = query.date_from;
      if (query.date_to) where.appointment_date.lte = query.date_to;
    }

    const appointments = await prisma.appointment.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        collaborator: true,
        establishment: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            image: true,
            latitude: true,
            longitude: true,
          },
        },
        service: {
          select: {
            id: true,
            description: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    return reply.code(200).send(appointments);
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateAppointmentStatus(
  request: FastifyRequest<{
    Params: { id: string };
    Body: z.infer<typeof updateAppointmentStatusSchema>;
  }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;
    const { status } = updateAppointmentStatusSchema.parse(request.body);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    const establishmentId = request.user?.establishment_id;
    if (establishmentId && appointment.establishment_id !== establishmentId) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        collaborator: true,
        establishment: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            image: true,
            latitude: true,
            longitude: true,
          },
        },
        service: {
          select: {
            id: true,
            description: true,
            price: true,
            duration: true,
          },
        },
      },
    });
    return reply.code(200).send(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
