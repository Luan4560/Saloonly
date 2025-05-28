import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/schemas/appointment.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function createAppointment(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const {
      user_id,
      establishment_id,
      collaborator_id,
      service_id,
      workingDays,
    } = appointmentSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return reply.code(400).send({
        message: "User not found",
      });
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
          },
        });
      })
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
  reply: FastifyReply
) {
  try {
    const appointments = await prisma.appointment.findMany({
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
