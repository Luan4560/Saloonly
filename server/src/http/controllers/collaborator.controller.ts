import { prisma } from "@/lib/prisma";
import {
  paginationQuerySchema,
  paginationSkipTake,
  type PaginationQuery,
} from "@/schemas/pagination.schema";
import {
  registerCollaboratorSchema,
  updateCollaboratorSchema,
} from "@/schemas/collaborator.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function createCollaborator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { name, phone, email, avatar, establishment_id } =
      registerCollaboratorSchema.parse(request.body);

    const establishment = await prisma.establishment.findUnique({
      where: { id: establishment_id },
    });

    if (!establishment) {
      return reply.code(404).send({
        message: "Establishment not found",
      });
    }

    const collaborator = await prisma.collaborator.create({
      data: {
        name,
        phone,
        email,
        avatar,
        establishment_id,
      },
    });

    return reply.code(201).send(collaborator);
  } catch (error) {
    request.log.error(error, "Error creating collaborator");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAllCollaborators(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  try {
    const query = paginationQuerySchema.parse(request.query ?? {});
    const { skip, take } = paginationSkipTake(query);
    const establishmentId = request.user?.establishment_id;
    const collaborators = await prisma.collaborator.findMany({
      where: establishmentId
        ? { establishment_id: establishmentId }
        : undefined,
      skip,
      take,
    });
    return reply.code(200).send(collaborators);
  } catch (error) {
    request.log.error(error, "Error fetching collaborators");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateCollaborator(
  request: FastifyRequest<{ Params: { collaborator_id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { collaborator_id } = request.params;
    const existing = await prisma.collaborator.findUnique({
      where: { id: collaborator_id },
    });
    if (!existing) {
      return reply.code(404).send({ message: "Collaborator not found" });
    }
    const establishmentId = request.user?.establishment_id;
    if (
      establishmentId &&
      existing.establishment_id &&
      existing.establishment_id !== establishmentId
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }
    const body = updateCollaboratorSchema.parse(request.body);

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.avatar !== undefined) data.avatar = body.avatar;
    if (body.role !== undefined) data.role = body.role;
    if (body.establishment_id !== undefined)
      data.establishment_id = body.establishment_id;

    const collaborator = await prisma.collaborator.update({
      where: { id: collaborator_id },
      data,
    });

    return reply.code(200).send(collaborator);
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
    request.log.error(error, "Error updating collaborator");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getCollaboratorById(
  request: FastifyRequest<{ Params: { collaborator_id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { collaborator_id } = request.params;
    const collaborator = await prisma.collaborator.findUnique({
      where: { id: collaborator_id },
    });
    if (!collaborator) {
      return reply.code(404).send({ message: "Collaborator not found" });
    }
    const establishmentId = request.user?.establishment_id;
    if (
      establishmentId &&
      collaborator.establishment_id &&
      collaborator.establishment_id !== establishmentId
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }
    return reply.code(200).send(collaborator);
  } catch (error) {
    request.log.error(error, "Error fetching collaborator by id");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteCollaborator(
  request: FastifyRequest<{ Params: { collaborator_id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { collaborator_id } = request.params;
    const existing = await prisma.collaborator.findUnique({
      where: { id: collaborator_id },
    });
    if (!existing) {
      return reply.code(404).send({ message: "Collaborator not found" });
    }
    const establishmentId = request.user?.establishment_id;
    if (
      establishmentId &&
      existing.establishment_id &&
      existing.establishment_id !== establishmentId
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }
    await prisma.collaborator.delete({
      where: {
        id: collaborator_id,
      },
    });

    return reply.code(200).send({
      message: "Collaborator deleted successfully",
    });
  } catch (error) {
    request.log.error(error, "Error deleting collaborator");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
