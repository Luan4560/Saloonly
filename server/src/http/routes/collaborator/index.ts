import {
  createCollaborator,
  deleteCollaborator,
  getAllCollaborators,
  getCollaboratorById,
  updateCollaborator,
} from "@/http/controllers/collaborator.controller";
import { FastifyTypedInstance } from "@/types";

export async function collaboratorRoutes(app: FastifyTypedInstance) {
  app.post(
    "/register",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Collaborator"],
        description: "Create a new collaborator",
      },
    },
    createCollaborator
  );

  app.get(
    "/list",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Collaborator"],
        description: "Get all collaborators",
      },
    },
    getAllCollaborators
  );

  app.get(
    "/:collaborator_id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Collaborator"],
        description: "Get a collaborator by id",
      },
    },
    getCollaboratorById
  );

  app.patch(
    "/:collaborator_id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Collaborator"],
        description: "Update a collaborator",
      },
    },
    updateCollaborator
  );

  app.delete(
    "/:collaborator_id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Collaborator"],
        description: "Delete a collaborator",
      },
    },
    deleteCollaborator
  );
}
