import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput, LoginUserInput } from "@/schemas/user.schema";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 10;

export async function createUser(
  req: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  const { password, email, name, role } = req.body;

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
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        email,
        name,
        role,
      },
    });

    return reply.code(201).send(user);
  } catch (error) {
    return reply.code(500).send(error);
  }
}

export async function login(
  req: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply
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
  };

  const token = req.jwt.sign(payload);

  reply.setCookie("access_token", token, {
    path: "/",
    httpOnly: true,
    secure: true,
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

  console.log(users);

  return reply.code(200).send(users);
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("access_token");

  return reply.code(200).send({ message: "Logout successful" });
}
