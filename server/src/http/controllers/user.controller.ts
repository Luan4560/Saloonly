import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateUserInput,
  LoginUserInput,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/user.schema";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const SALT_ROUNDS = 10;

export async function createUser(
  req: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
) {
  const { confirmPassword, password, email, name, role } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return reply.code(401).send({
      message: "User already exists with this email",
    });
  }

  try {
    if (password !== confirmPassword) {
      return reply.code(401).send({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const validRole = role.toUpperCase() as "ADMIN" | "COLLABORATOR" | "USER";
    if (!["ADMIN", "COLLABORATOR", "USER"].includes(validRole)) {
      return reply.code(400).send({ message: "Invalid role value" });
    }

    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        confirm_password: hashedPassword,
        email,
        name,
        role: validRole,
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
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function login(
  req: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply,
) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return reply.code(401).send({
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid || !user.email) {
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
  });

  return { accessToken: token };
}

export async function getUsers(req: FastifyRequest, reply: FastifyReply) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
    },
  });

  return reply.code(200).send(users);
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("access_token");

  return reply.code(200).send({ message: "Logout successful" });
}

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function forgotPassword(req: FastifyRequest, reply: FastifyReply) {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.code(200).send({
      message:
        "Se o e-mail existir na base, você receberá um link para redefinir a senha.",
    });
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);
  await prisma.passwordResetToken.create({
    data: { token, user_id: user.id, expires_at: expiresAt },
  });
  const baseUrl = env.FRONTEND_URL;
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  if (env.NODE_ENV !== "production") {
    req.log.info({ resetLink }, "Password reset link (dev)");
  }
  return reply.code(200).send({
    message:
      "Se o e-mail existir na base, você receberá um link para redefinir a senha.",
    ...(env.NODE_ENV !== "production" && { resetLink }),
  });
}

export async function resetPassword(req: FastifyRequest, reply: FastifyReply) {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.expires_at < new Date()) {
    return reply.code(400).send({
      message: "Link inválido ou expirado. Solicite uma nova redefinição.",
    });
  }
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user_id },
      data: {
        password: hashedPassword,
        confirm_password: hashedPassword,
      },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);
  return reply.code(200).send({
    message: "Senha alterada com sucesso. Faça login com a nova senha.",
  });
}
