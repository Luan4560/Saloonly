import {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import { FastifyJWT } from "@fastify/jwt";
import { JWT } from "@fastify/jwt";

export type UserPayload = {
  id: string;
  email: string;
  name: string;
  establishment_id?: string;
  role?: "ADMIN" | "COLLABORATOR" | "USER";
};

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }

  export interface FastifyInstance {
    authenticate: any;
    optionalAuthenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger
>;
