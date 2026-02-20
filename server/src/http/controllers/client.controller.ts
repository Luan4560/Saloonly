import bcrypt from "bcryptjs";
import z from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/prisma";
import { createAppointmentsWithPayload } from "./appointment.controller";
import {
  ClientBookingInput,
  ClientLoginInput,
  ClientRegisterInput,
} from "@/schemas/client.schema";

const SALT_ROUNDS = 10;

export async function clientRegister(
  req: FastifyRequest<{ Body: ClientRegisterInput }>,
  reply: FastifyReply,
) {
  const { confirmPassword, password, email, name } = req.body;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return reply.code(409).send({
      message: "User already exists with this email",
    });
  }

  if (password !== confirmPassword) {
    return reply.code(400).send({ message: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      password: hashedPassword,
      email,
      name,
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
    },
  });

  return reply.code(201).send(user);
}

export async function clientLogin(
  req: FastifyRequest<{ Body: ClientLoginInput }>,
  reply: FastifyReply,
) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return reply.code(401).send({
      message: "Invalid credentials",
    });
  }

  if (user.role !== "USER") {
    return reply.code(403).send({
      message: "This login is for clients only. Use the admin panel to sign in.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return reply.code(401).send({
      message: "Invalid credentials",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    ...(user.establishment_id && { establishment_id: user.establishment_id }),
    role: user.role,
  };

  const token = req.jwt.sign(payload);

  reply.setCookie("access_token", token, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });

  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "USER",
    ...(user.establishment_id && { establishment_id: user.establishment_id }),
  };

  return reply.code(200).send({ accessToken: token, user: userResponse });
}

export async function clientLogout(
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  reply.clearCookie("access_token");
  return reply.code(200).send({ message: "Logout successful" });
}

export async function createClientAppointment(
  req: FastifyRequest<{ Body: ClientBookingInput }>,
  reply: FastifyReply,
) {
  try {
    const body = req.body;
    const user_id = req.user?.id ?? null;
    const isGuest = !user_id;

    if (isGuest) {
      if (!body.guest_name || !body.guest_email || !body.guest_phone) {
        return reply.code(400).send({
          message:
            "Guest booking requires guest_name, guest_email and guest_phone",
        });
      }
    }

    return createAppointmentsWithPayload(req, reply, {
      establishment_id: body.establishment_id,
      collaborator_id: body.collaborator_id,
      service_ids: body.service_ids,
      workingDays: body.workingDays,
      user_id,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      guest_phone: body.guest_phone,
    });
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
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

const clientAppointmentInclude = {
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
  services: {
    select: {
      id: true,
      description: true,
      price: true,
      duration: true,
    },
  },
};

export async function getMyAppointments(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = req.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Authorization required" });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { user_id: userId },
      orderBy: { appointment_date: "asc" },
      include: clientAppointmentInclude,
    });
    return reply.code(200).send(appointments);
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function cancelClientAppointment(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = req.user?.id;
  if (!userId) {
    return reply.code(401).send({ message: "Authorization required" });
  }

  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    if (appointment.user_id !== userId) {
      return reply.code(403).send({
        message: "You can only cancel your own appointments",
      });
    }

    if (
      appointment.status === Status.CANCELED ||
      appointment.status === Status.COMPLETED
    ) {
      return reply.code(400).send({
        message: `Appointment cannot be canceled (current status: ${appointment.status})`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: Status.CANCELED },
      include: clientAppointmentInclude,
    });
    return reply.code(200).send(updated);
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
