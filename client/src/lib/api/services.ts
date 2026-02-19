import { api } from "./axios";

export type EstablishmentType = "BARBERSHOP" | "BEAUTY_SALON";

export interface Service {
  id: string;
  description?: string;
  price: number | string;
  duration: number;
  establishment_type: EstablishmentType;
  active: boolean;
  establishment_id?: string;
}

export async function getServices() {
  const { data } = await api.get("/admin/services/list");
  return data;
}

export async function getServiceById(id: string) {
  const { data } = await api.get(`/admin/services/${id}`);
  return data;
}

export async function createService(body: {
  description?: string;
  price: number;
  duration: number;
  establishment_id: string;
  establishmentType?: EstablishmentType;
}) {
  const { data } = await api.post("/admin/services/register", body);
  return data;
}

export async function updateService(
  id: string,
  body: {
    description?: string;
    price?: number;
    duration?: number;
    establishmentType?: EstablishmentType;
    active?: boolean;
  },
) {
  const { data } = await api.patch(`/admin/services/${id}`, body);
  return data;
}

export async function deleteService(id: string) {
  await api.delete(`/admin/services/${id}`);
}
