import { prisma } from "@/lib/prisma";
import { registerCollaboratorSchema } from "@/schemas/collaborator.schema";
import { Specialties, WorkingDays } from "@prisma/client";
import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";

export async function createCollaborator(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const {
      name,
      phone,
      email,
      price,
      avatar,
      role,
      establishment_id,
      servicesId,
      working_days,
      working_hours,
      specialties,
    } = registerCollaboratorSchema.parse(request.body);

    // Check if establishment exists
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishment_id },
    });

    if (!establishment) {
      return reply.status(404).send({
        message: "Establishment not found",
      });
    }

    // Check if service exists
    const service = await prisma.services.findUnique({
      where: { id: servicesId },
    });

    if (!service) {
      return reply.status(404).send({
        message: "Service not found",
      });
    }

    const collaborator = await prisma.collaborator.create({
      data: {
        id: randomUUID(),
        name,
        phone,
        email,
        price,
        avatar,
        role,
        establishment_id,
        servicesId,
        working_hours,
        working_days: working_days as WorkingDays[],
        specialties: specialties[0] as Specialties,
      },
    });

    return reply.status(201).send(collaborator);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
