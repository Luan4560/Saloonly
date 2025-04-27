import { prisma } from "@/lib/prisma";
import { registerCollaboratorSchema } from "@/schemas/collaborator.schema";
import { Collaborator, Specialties, WorkingDays } from "@prisma/client";
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

    const establishment = await prisma.establishment.findUnique({
      where: { id: establishment_id },
    });

    if (!establishment) {
      return reply.code(404).send({
        message: "Establishment not found",
      });
    }

    const service = await prisma.services.findUnique({
      where: { id: servicesId },
    });

    if (!service) {
      return reply.code(404).send({
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

    return reply.code(201).send(collaborator);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAllCollaborators(
  _: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const collaborators = await prisma.collaborator.findMany();
    return reply.code(200).send(collaborators);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateCollaborator(
  request: FastifyRequest<{
    Params: { collaborator_id: string };
    Body: Collaborator;
  }>,
  reply: FastifyReply
) {
  try {
    const { collaborator_id } = request.params;
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
    } = request.body;

    const collaborator = await prisma.collaborator.update({
      where: {
        id: collaborator_id,
      },
      data: {
        name,
        phone,
        email,
        price,
        avatar,
        role,
        establishment_id,
        servicesId,
        working_days,
        specialties: specialties[0] as Specialties,
        working_hours,
      },
    });

    return reply.code(200).send(collaborator);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getCollaboratorById(
  request: FastifyRequest<{ Params: { collaborator_id: string } }>,
  reply: FastifyReply
) {
  try {
    const { collaborator_id } = request.params;

    const collaborator = await prisma.collaborator.findUnique({
      where: { id: collaborator_id },
    });

    return reply.code(200).send(collaborator);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteCollaborator(
  request: FastifyRequest<{ Params: { collaborator_id: string } }>,
  reply: FastifyReply
) {
  try {
    const { collaborator_id } = request.params;

    await prisma.collaborator.delete({
      where: {
        id: collaborator_id,
      },
    });

    return reply.code(200).send({
      message: "Collaborator deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
