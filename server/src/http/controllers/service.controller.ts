import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@/schemas/service.schema";

export async function createService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const {
      name,
      description,
      establishmentType,
      establishment_id,
      price,
      duration,
      active,
    } = createServiceSchema.parse(request.body);

    const isExistService = await prisma.services.findFirst({
      where: {
        name,
      },
    });

    if (isExistService) {
      return reply.code(400).send({ message: "Service already exists" });
    }

    const service = await prisma.services.create({
      data: {
        name,
        description,
        price,
        duration,
        establishmentType,
        establishment_id,
        active,
      },
    });

    return reply.code(201).send({
      service,
    });
  } catch (error) {
    return reply.code(500).send({
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
    const { establishment_id } = request.params as {
      establishment_id: string;
    };

    if (!establishment_id) {
      return reply.code(400).send({ message: "Establishment ID is required" });
    }

    const services = await prisma.services.findMany({
      where: {
        establishment_id,
      },
    });

    return reply.code(200).send({
      services,
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Error fetching services",
      error,
    });
  }
}

export async function updateService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { service_id } = request.params as {
      service_id: string;
    };

    if (!service_id) {
      return reply.code(400).send({
        message: "Establishment ID is required",
      });
    }

    const { name, description, duration, price, active } =
      updateServiceSchema.parse(request.body);

    const service = await prisma.services.update({
      where: {
        id: service_id,
      },
      data: {
        name,
        description,
        duration,
        price,
        active,
      },
    });

    return reply.code(200).send({
      service,
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Error updating service",
      error,
    });
  }
}

export async function deleteService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { service_id } = request.params as {
      service_id: string;
    };

    if (!service_id) {
      return reply.code(400).send({ message: "Service ID is required" });
    }

    await prisma.services.delete({
      where: {
        id: service_id,
      },
    });

    return reply.code(200).send({
      message: "Service deleted successfully",
    });
  } catch (error) {
    return reply.code(500).send({
      message: "Error deleting service",
    });
  }
}
