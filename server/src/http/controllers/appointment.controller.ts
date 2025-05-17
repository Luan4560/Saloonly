import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "@/schemas/appontment.schema";
import { getDayName } from "@/utils";
import { FastifyReply, FastifyRequest } from "fastify";

export async function createAppointment(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const {
      user_id,
      collaborator_id,
      establishment_id,
      service_id,
      appointment_date,
    } = createAppointmentSchema.parse(request.body);

    // Convert appointment_date string to Date object
    const appointmentDateTime = new Date(appointment_date);
    const dayOfWeek = appointmentDateTime.getDay();
    const timeString = appointmentDateTime.toLocaleTimeString("pt-BR", {
      hour12: false,
    });

    // Get establishment details
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishment_id },
    });

    if (!establishment) {
      return reply.code(404).send({
        message: "Establishment not found",
      });
    }

    // Check if establishment is open
    const openingHours = establishment.opening_hours as {
      days: string[];
      open: boolean;
      open_time: string | null;
      close_time: string | null;
    }[];

    const todaySchedule = openingHours.find((schedule) =>
      schedule.days.includes(getDayName(dayOfWeek))
    );

    if (
      !todaySchedule ||
      !todaySchedule.open ||
      !todaySchedule.open_time ||
      !todaySchedule.close_time
    ) {
      return reply.code(400).send({
        message: "Establishment is closed on this day",
      });
    }

    if (
      timeString < todaySchedule.open_time ||
      timeString > todaySchedule.close_time
    ) {
      return reply.code(400).send({
        message: "Appointment time is outside establishment's working hours",
      });
    }

    // Get collaborator details
    const collaborator = await prisma.collaborator.findUnique({
      where: { id: collaborator_id },
    });

    if (!collaborator) {
      return reply.code(404).send({
        message: "Collaborator not found",
      });
    }

    // Check if collaborator works on this day
    const collaboratorWorkingDays = await prisma.workingDay.findMany({
      where: {
        collaborator_id,
      },
    });

    if (!collaboratorWorkingDays.includes(getDayName(dayOfWeek) as any)) {
      return reply.code(400).send({
        message: "Collaborator does not work on this day",
      });
    }

    // Check if time is within collaborator's working hours
    const collaboratorWorkingHours = await prisma.workingDay.findMany({
      where: {
        collaborator_id,
      },
    });

    // Get service details to check duration
    const service = await prisma.service.findUnique({
      where: { id: service_id },
    });

    if (!service) {
      return reply.code(404).send({
        message: "Service not found",
      });
    }

    // Check if there are any overlapping appointments
    const appointmentEnd = new Date(
      appointmentDateTime.getTime() + service.duration * 60000
    );

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        collaborator_id,
        OR: [
          {
            AND: [
              { created_at: { lte: appointmentDateTime } },
              { created_at: { gte: appointmentEnd } },
            ],
          },
          {
            AND: [
              { created_at: { lte: appointmentEnd } },
              { created_at: { gte: appointmentDateTime } },
            ],
          },
        ],
        NOT: {
          status: "CANCELED",
        },
      },
    });

    if (existingAppointments.length > 0) {
      return reply.code(400).send({
        message: "Collaborator already has an appointment at this time",
      });
    }

    // Create the appointment if all checks pass
    const appointment = await prisma.appointment.create({
      data: {
        user_id,
        collaborator_id,
        establishment_id,
        service_id,
      },
    });

    return reply.code(201).send(appointment);
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAppointments(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        collaborator: true,
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
