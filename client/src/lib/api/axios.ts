import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useClientAuthStore } from "@/stores/clientAuthStore";

const apiURI = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiURI,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const isClientRequest = config.url?.includes("/client/");
  const token = isClientRequest
    ? useClientAuthStore.getState().accessToken
    : useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAdminAuthEndpoint =
      error.config?.url?.includes("/admin/users/login") ||
      error.config?.url?.includes("/admin/users/register");
    const isClientRequest = error.config?.url?.includes("/client/");
    if (
      error.response?.status === 401 &&
      !isAdminAuthEndpoint &&
      !isClientRequest
    ) {
      useAuthStore.getState().logout();
      window.location.href = "/";
      return Promise.reject(error);
    }
    if (!isAdminAuthEndpoint && !isClientRequest) {
      const message =
        error.response?.data?.message ??
        error.message ??
        "Erro ao comunicar com o servidor";
      toast.error(message);
    }
    return Promise.reject(error);
  },
);
