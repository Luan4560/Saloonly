import { FastifyInstance } from "fastify";

export function registerSecurityHeaders(app: FastifyInstance) {
  app.addHook("onRequest", async (_, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("X-XSS-Protection", "1; mode=block");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
  });
}
