import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const apiURI = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiURI,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/admin/users/login") ||
      error.config?.url?.includes("/admin/users/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = "/";
      return Promise.reject(error);
    }
    if (!isAuthEndpoint) {
      const message =
        error.response?.data?.message ??
        error.message ??
        "Erro ao comunicar com o servidor";
      toast.error(message);
    }
    return Promise.reject(error);
  },
);
