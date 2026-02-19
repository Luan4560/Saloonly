import { api } from "./axios";
import type { AuthUser } from "@/stores/authStore";

export interface Establishment {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  description?: string;
  image: string;
}

export interface CreateEstablishmentResponse extends Establishment {
  accessToken?: string;
  user?: AuthUser;
}

export async function getEstablishments() {
  const { data } = await api.get("/admin/establishments/list");
  return data;
}

export async function getEstablishmentById(id: string) {
  const { data } = await api.get(`/admin/establishments/${id}`);
  return data;
}

export async function createEstablishment(body: {
  name: string;
  phone: string;
  email: string;
  address: string;
  description?: string;
  image: string;
  password: string;
  workingDays: { day_of_week: string; open_time: string; close_time: string }[];
  specialDates?: {
    date: string;
    is_closed: boolean;
    open_time?: string;
    close_time?: string;
  }[];
  collaborators?: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    role?: string;
  }[];
  services?: {
    description?: string;
    price: number;
    duration: number;
    establishment_type: string;
    active?: boolean;
  }[];
}): Promise<CreateEstablishmentResponse> {
  const { data } = await api.post("/admin/establishments/register", body);
  return data;
}

export async function updateEstablishment(
  id: string,
  body: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    image?: string;
  },
) {
  const { data } = await api.patch(`/admin/establishments/${id}`, body);
  return data;
}

export async function deleteEstablishment(id: string) {
  await api.delete(`/admin/establishments/${id}`);
}
