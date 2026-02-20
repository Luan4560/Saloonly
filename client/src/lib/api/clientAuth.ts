import { api } from "./axios";

export interface ClientAuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER";
  establishment_id?: string | null;
}

export interface ClientLoginResponse {
  accessToken: string;
  user: ClientAuthUser;
}

export interface ClientRegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface ClientLoginPayload {
  email: string;
  password: string;
}

export async function clientRegister(
  payload: ClientRegisterPayload
): Promise<{ id: string; email: string; name: string | null; role: "USER"; phone: string | null }> {
  const { data } = await api.post("/client/auth/register", payload, {
    withCredentials: true,
  });
  return data;
}

export async function clientLogin(
  payload: ClientLoginPayload
): Promise<ClientLoginResponse> {
  const { data } = await api.post<ClientLoginResponse>(
    "/client/auth/login",
    payload,
    { withCredentials: true }
  );
  return data;
}

export async function clientLogout(): Promise<void> {
  await api.post("/client/auth/logout", {}, { withCredentials: true });
}

export interface ClientBookingWorkingDay {
  day_of_week: string;
  open_time: string;
  close_time: string;
  appointment_date: string; // ISO date string
}

export interface CreateBookingPayload {
  establishment_id: string;
  collaborator_id: string;
  service_ids: string[];
  workingDays: ClientBookingWorkingDay[];
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

export interface CreateBookingResponse {
  message: string;
  appointments: unknown[];
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<CreateBookingResponse> {
  const body = {
    ...payload,
    workingDays: payload.workingDays.map((wd) => ({
      ...wd,
      appointment_date: wd.appointment_date,
    })),
  };
  const { data } = await api.post<CreateBookingResponse>(
    "/client/appointments",
    body,
    { withCredentials: true }
  );
  return data;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELED";

export interface MyAppointmentService {
  id: string;
  description: string | null;
  price: string;
  duration: number;
}

export interface MyAppointmentEstablishment {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  image: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface MyAppointmentCollaborator {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface MyAppointment {
  id: string;
  appointment_date: string;
  status: AppointmentStatus;
  day_of_week: string;
  open_time: string;
  close_time: string;
  collaborator: MyAppointmentCollaborator;
  establishment: MyAppointmentEstablishment;
  services: MyAppointmentService[];
}

export async function getMyAppointments(): Promise<MyAppointment[]> {
  const { data } = await api.get<MyAppointment[]>("/client/appointments", {
    withCredentials: true,
  });
  return data;
}

export async function cancelAppointment(id: string): Promise<MyAppointment> {
  const { data } = await api.patch<MyAppointment>(
    `/client/appointments/${id}/cancel`,
    {},
    { withCredentials: true }
  );
  return data;
}
