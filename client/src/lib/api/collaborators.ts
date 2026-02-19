import { api } from "./axios";

export interface Collaborator {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  establishment_id?: string;
}

export async function getCollaborators() {
  const { data } = await api.get("/admin/collaborators/list");
  return data;
}

export async function getCollaboratorById(id: string) {
  const { data } = await api.get(`/admin/collaborators/${id}`);
  return data;
}

export async function createCollaborator(body: {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  establishment_id: string;
}) {
  const { data } = await api.post("/admin/collaborators/register", body);
  return data;
}

export async function updateCollaborator(
  id: string,
  body: {
    name?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    establishment_id?: string;
  },
) {
  const { data } = await api.patch(`/admin/collaborators/${id}`, body);
  return data;
}

export async function deleteCollaborator(id: string) {
  await api.delete(`/admin/collaborators/${id}`);
}
