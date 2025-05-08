import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { createServiceSchema } from "@/schemas/service.schema";

export async function createService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const {
      description,
      establishmentType,
      establishment_id,
      price,
      duration,
    } = createServiceSchema.parse(request.body);

    const service = await prisma.services.create({
      data: {
        description,
        establishmentType,
        establishment_id,
        price,
        duration,
      },
    });

    return reply.status(201).send({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Error creating service",
      error,
    });
  }
}

export async function getServices(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const services = await prisma.services.findMany();

    return reply.code(200).send(services);
  } catch (error) {
    return reply.code(500).send({
      message: "Error fetching services",
      error,
    });
  }
}

export async function getServiceById(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const service = await prisma.services.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return reply.code(404).send({
        message: "Service not found",
      });
    }

    return reply.code(200).send(service);
  } catch (error) {
    return reply.code(500).send({
      message: "Error fetching services",
      error,
    });
  }
}

export async function deleteService(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    await prisma.services.delete({
      where: {
        id,
      },
    });

    return reply.code(200).send({
      message: "Service deleted successfully",
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Error deleting services",
      error,
    });
  }
}
