import { api } from "./axios";

export interface Appointment {
  id: string;
  user_id: string;
  collaborator_id: string;
  establishment_id: string;
  service_id: string;
  status: string;
  appointment_date: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
  collaborator?: { id: string; name: string; email: string };
  establishment?: { id: string; name: string };
  service?: {
    id: string;
    description: string | null;
    price: number | string;
    duration: number;
  };
}

export async function getAppointments(params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  const { data } = await api.get("/admin/appointments/list", { params });
  return data;
}

export async function createAppointment(body: {
  user_id?: string;
  establishment_id: string;
  collaborator_id: string;
  service_id: string;
  appointment_date?: string;
  workingDays: {
    day_of_week: string;
    open_time: string;
    close_time: string;
    appointment_date: string;
  }[];
}) {
  const { data } = await api.post("/admin/appointments/register", body);
  return data;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { data } = await api.patch(`/admin/appointments/${id}/status`, {
    status,
  });
  return data;
}
