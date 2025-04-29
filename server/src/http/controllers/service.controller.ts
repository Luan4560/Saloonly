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
      serviceType,
      collaborator_id,
      price,
      duration,
    } = createServiceSchema.parse(request.body);

    const service = await prisma.services.create({
      data: {
        description,
        establishmentType,
        establishment_id,
        serviceType,
        price,
        duration,
        Collaborator: {
          connect: {
            id: collaborator_id,
          },
        },
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
