import { prisma } from "@/lib/prisma";
import { EstablishmentType } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@/schemas/service.schema";
import z from "zod";

const DEFAULT_ESTABLISHMENT_TYPE = EstablishmentType.BARBERSHOP;

export async function createService(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = createServiceSchema.parse(request.body);
    const {
      description,
      establishment_id,
      price,
      duration,
    } = body;
    const establishment_type: EstablishmentType =
      body.establishmentType ?? DEFAULT_ESTABLISHMENT_TYPE;

    const service = await prisma.service.create({
      data: {
        description,
        establishment_id,
        price,
        duration,
        establishment_type,
      },
    });

    return reply.code(201).send({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Error creating service",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getServices(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    let establishmentId: string | undefined = request.user?.establishment_id;
    if (request.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { establishment_id: true },
      });
      if (user?.establishment_id) establishmentId = user.establishment_id;
    }
    const services = await prisma.service.findMany({
      where: establishmentId ? { establishment_id: establishmentId } : undefined,
    });

    return reply.code(200).send(services);
  } catch (error) {
    return reply.code(500).send({
      message: "Error fetching services",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getServiceById(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return reply.code(404).send({
        message: "Service not found",
      });
    }

    let establishmentId: string | undefined = request.user?.establishment_id;
    if (request.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { establishment_id: true },
      });
      if (user?.establishment_id) establishmentId = user.establishment_id;
    }
    if (
      establishmentId &&
      service.establishment_id &&
      service.establishment_id !== establishmentId
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    return reply.code(200).send(service);
  } catch (error) {
    return reply.code(500).send({
      message: "Error fetching services",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateService(
  request: FastifyRequest<{
    Params: { id: string };
    Body: z.infer<typeof updateServiceSchema>;
  }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;
    const body = updateServiceSchema.parse(request.body);

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return reply.code(404).send({ message: "Service not found" });
    }

    let establishmentId: string | undefined = request.user?.establishment_id;
    if (request.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { establishment_id: true },
      });
      if (user?.establishment_id) establishmentId = user.establishment_id;
    }
    if (
      establishmentId &&
      service.establishment_id &&
      service.establishment_id !== establishmentId
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const data: Record<string, unknown> = {};
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = body.price;
    if (body.duration !== undefined) data.duration = body.duration;
    if (body.establishmentType !== undefined)
      data.establishment_type = body.establishmentType;
    if (body.active !== undefined) data.active = body.active;

    const updated = await prisma.service.update({
      where: { id },
      data,
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
      message: "Error updating service",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteService(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return reply.code(404).send({ message: "Service not found" });
    }
    let establishmentId: string | undefined = request.user?.establishment_id;
    if (request.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { establishment_id: true },
      });
      if (user?.establishment_id) establishmentId = user.establishment_id;
    }
    if (
      establishmentId &&
      service.establishment_id &&
      service.establishment_id !== establishmentId
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }
    await prisma.service.delete({
      where: { id },
    });

    return reply.code(200).send({
      message: "Service deleted successfully",
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Error deleting services",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
