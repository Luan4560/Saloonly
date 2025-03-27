import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

export const app = fastify();

const prisma = new PrismaClient();

prisma.barberShop.create({
  data: {
    id: randomUUID(),
    name: "John Doe",
    email: "john.doe@example.com",
    password: "123456",
    phone: "1234567890",
    address: "123 Main St",
    created_at: new Date(),
    updated_at: new Date(),
    image: "https://example.com/image.jpg",
    latitude: 0,
    longitude: 0,
    services: ["Barba", "Cabelo"],
    opening_hours: ["08:00", "18:00"],
  },
});
