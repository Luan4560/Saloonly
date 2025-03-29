import { fastify } from "fastify";
import { routes } from "./http/routes";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { validatorCompiler, serializerCompiler, jsonSchemaTransform} from "fastify-type-provider-zod"
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyCors } from "@fastify/cors";


export const app = fastify().withTypeProvider<ZodTypeProvider>();


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {origin: "*"});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Saloonly API Documentation",
      description: "Saloonly API Documentation",
      version: "1.0.0",
    }
  },

  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs"
})

app.register(routes);