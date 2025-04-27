import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { registerBodySchemaRequest } from "@/schemas/establishment.schema";
import { Establishment } from "@prisma/client";

export async function registerEstablishment(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {
    name,
    phone,
    email,
    address,
    image,
    password_hash,
    latitude,
    longitude,
    opening_hours,
    services,
  } = registerBodySchemaRequest.parse(request.body);

  const establishment = await prisma.establishment.create({
    data: {
      id: randomUUID(),
      name,
      phone,
      email,
      address,
      image,
      password_hash,
      latitude,
      longitude,
      opening_hours,
    },
  });

  if (services && services.length > 0) {
    await prisma.services.createMany({
      data: services.map((service) => ({
        ...service,
        establishment_id: establishment.id,
      })),
    });
  }

  return reply.code(201).send();
}

export async function getEstablishments(
  _: FastifyRequest,
  reply: FastifyReply
) {
  const establishments = await prisma.establishment.findMany();

  if (!establishments) {
    return reply.code(404).send({ message: "Establishments not found" });
  }

  return reply.code(200).send(establishments);
}

export async function getEstablishmentById(
  request: FastifyRequest<{ Params: { establishment_id: string } }>,
  reply: FastifyReply
) {
  const { establishment_id } = request.params;

  const establishment = await prisma.establishment.findUnique({
    where: {
      id: establishment_id,
    },
  });

  if (!establishment) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  return reply.code(200).send(establishment);
}

export async function updateEstablishment(
  request: FastifyRequest<{
    Body: Establishment;
    Params: { establishment_id: string };
  }>,
  reply: FastifyReply
) {
  const { establishment_id } = request.params;
  const { name, phone, email, address, image } = request.body;

  const isEstablishemntExists = await prisma.establishment.findUnique({
    where: {
      id: establishment_id,
    },
  });

  if (!isEstablishemntExists) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  const establishment = await prisma.establishment.update({
    where: {
      id: establishment_id,
    },
    data: {
      name,
      phone,
      email,
      address,
      image,
    },
  });

  return reply.code(200).send(establishment);
}

export async function deleteEstablishment(
  request: FastifyRequest<{ Params: { establishment_id: string } }>,
  reply: FastifyReply
) {
  const { establishment_id } = request.params;

  const isEstablishemntExists = await prisma.establishment.findUnique({
    where: {
      id: establishment_id,
    },
  });

  if (!isEstablishemntExists) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  await prisma.establishment.delete({
    where: {
      id: establishment_id,
    },
  });

  return reply.code(200).send({ message: "Establishment deleted" });
}
