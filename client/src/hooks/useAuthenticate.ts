import { formLoginSchema } from "@/schemas/login";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api/axios";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface ApiError extends Error {
  response?: {
    data: {
      message: string;
    };
  };
}

export const useAuthenticate = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const establishmentId = useAuthStore((state) => state.establishmentId);
  const isLoading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const setError = useAuthStore((state) => state.setError);
  const setLoading = useAuthStore((state) => state.setLoading);

  const form = useForm<z.infer<typeof formLoginSchema>>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formLoginSchema>) {
    try {
      setLoading(true);
      const response = await api.post("/admin/users/login", values);

      useAuthStore.getState().login(response.data.accessToken, response.data.user);
    } catch (error: unknown) {
      console.log("Failed to login", error);
      const apiError = error as ApiError;
      setError(apiError);
      toast.error(apiError.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }
  return { form, onSubmit, accessToken, establishmentId, isLoading, error };
};
