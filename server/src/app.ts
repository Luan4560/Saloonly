import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fCookie from "@fastify/cookie";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyCors } from "@fastify/cors";
import { establishmentRoutes } from "@/http/routes/establishment";
import { userRoutes } from "@/http/routes/user";
import { collaboratorRoutes } from "@/http/routes/collaborator";
import { servicesRoutes } from "@/http/routes/service";
import { appointmentRoutes } from "@/http/routes/appointment";
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { parseData } from "@/middlewares/parseData";
import { env } from "@/env";

const SECRETJWT = env.JWT_SECRET;

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, {
  origin:
    env.NODE_ENV === "dev"
      ? ["http://localhost:5173", "http://localhost:5174"]
      : env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
});
app.register(fjwt, { secret: SECRETJWT });

app.addHook("preHandler", (req, _, next) => {
  req.jwt = app.jwt;
  return next();
});

parseData();

app.register(fCookie, {
  secret: env.COOKIE_SECRET,
  hook: "preHandler",
});

app.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.access_token;

    if (!token) {
      return reply.code(401).send({ message: "Authorization required" });
    }

    try {
      const decoded = req.jwt.verify<FastifyJWT["user"]>(token);
      req.user = decoded;
    } catch {
      return reply.code(401).send({ message: "Invalid or expired token" });
    }
  },
);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Saloonly API Documentation",
      description: "Saloonly API Documentation",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(userRoutes, { prefix: "/api/admin/users" });
app.register(establishmentRoutes, { prefix: "/api/admin/establishments" });
app.register(collaboratorRoutes, { prefix: "/api/admin/collaborators" });
app.register(servicesRoutes, { prefix: "/api/admin/services" });
app.register(appointmentRoutes, { prefix: "/api/admin/appointments" });
