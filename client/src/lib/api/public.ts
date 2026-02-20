import { api } from "./axios";

export type EstablishmentType = "BARBERSHOP" | "BEAUTY_SALON";

export interface PublicEstablishmentWorkingDay {
  day_of_week: string;
  open_time: string;
  close_time: string;
}

export interface PublicEstablishmentSpecialDate {
  date: string;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface PublicEstablishment {
  id: string;
  name: string;
  phone: string;
  description: string | null;
  email: string;
  address: string;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  establishment_type: EstablishmentType;
  created_at: string;
  updated_at: string;
  workingDays: PublicEstablishmentWorkingDay[];
  specialDates: PublicEstablishmentSpecialDate[];
}

export interface PublicEstablishmentService {
  id: string;
  description: string | null;
  price: string;
  duration: number;
  establishment_type: EstablishmentType;
}

export interface PublicEstablishmentCollaborator {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  avatar: string | null;
  role: string | null;
}

export interface PublicEstablishmentDetail extends PublicEstablishment {
  services: PublicEstablishmentService[];
  collaborators: PublicEstablishmentCollaborator[];
}

export interface SearchEstablishmentsParams {
  name?: string;
  type?: EstablishmentType;
  address?: string;
  page?: number;
  limit?: number;
}

export async function searchEstablishments(
  params: SearchEstablishmentsParams = {}
): Promise<PublicEstablishment[]> {
  const { data } = await api.get<PublicEstablishment[]>(
    "/public/establishments",
    { params }
  );
  return data;
}

export async function getEstablishmentDetails(
  id: string
): Promise<PublicEstablishmentDetail> {
  const { data } = await api.get<PublicEstablishmentDetail>(
    `/public/establishments/${id}`
  );
  return data;
}

export async function getEstablishmentServices(
  id: string
): Promise<PublicEstablishmentService[]> {
  const { data } = await api.get<PublicEstablishmentService[]>(
    `/public/establishments/${id}/services`
  );
  return data;
}

export async function getEstablishmentCollaborators(
  id: string
): Promise<PublicEstablishmentCollaborator[]> {
  const { data } = await api.get<PublicEstablishmentCollaborator[]>(
    `/public/establishments/${id}/collaborators`
  );
  return data;
}

export interface AvailableSlot {
  open_time: string;
  close_time: string;
}

export interface GetAvailableSlotsParams {
  date: Date;
  collaborator_id?: string;
  slot_duration_minutes?: number;
}

export async function getAvailableSlots(
  establishmentId: string,
  params: GetAvailableSlotsParams
): Promise<{ date: string; slots: AvailableSlot[] }> {
  const { data } = await api.get<{ date: string; slots: AvailableSlot[] }>(
    `/public/establishments/${establishmentId}/available-slots`,
    {
      params: {
        date: params.date.toISOString().slice(0, 10),
        collaborator_id: params.collaborator_id,
        slot_duration_minutes: params.slot_duration_minutes ?? 30,
      },
    }
  );
  return data;
}
