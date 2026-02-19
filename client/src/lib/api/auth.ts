import { api } from "./axios";
import type { AuthUser } from "@/stores/authStore";

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/admin/users/me");
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post("/admin/users/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post("/admin/users/reset-password", {
    token,
    newPassword,
  });
  return data;
}

export async function updateProfile(body: {
  name?: string;
  email?: string;
}): Promise<AuthUser> {
  const { data } = await api.patch<AuthUser>("/admin/users/me", body);
  return data;
}
