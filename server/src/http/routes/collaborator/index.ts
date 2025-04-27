import { createCollaborator } from "@/http/controllers/collaborator.controller";
import { FastifyTypedInstance } from "@/types";
import { z } from "zod";
import { registerCollaboratorSchema } from "@/schemas/collaborator.schema";

export async function collaboratorRoutes(app: FastifyTypedInstance) {
  app.post(
    "/create-collaborator",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Collaborator"],
        description: "Create a new collaborator",
        body: registerCollaboratorSchema,
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            phone: z.string(),
            email: z.string(),
            specialties: z.string(),
            price: z.number(),
            avatar: z.string(),
            role: z.enum(["ADMIN", "COLLABORATOR"]),
            establishment_id: z.string().nullable(),
            servicesId: z.string().nullable(),
            working_days: z.array(z.string()),
            working_hours: z.array(z.string()),
            created_at: z.string(),
            updated_at: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    createCollaborator
  );
}
