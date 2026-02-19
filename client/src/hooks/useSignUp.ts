import { api } from "@/lib/api/axios";
import { formSignUp } from "@/schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import z from "zod";

export const useSignUp = () => {
  const navigate = useNavigate();
  const [responseStatus, setResponseStatus] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSignUp>>({
    resolver: zodResolver(formSignUp),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "ADMIN",
    },
  });

  async function onSubmit(values: z.infer<typeof formSignUp>) {
    try {
      const response = await api.post("/admin/users/register", values);
      setResponseStatus(response?.status);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "An error occurred");
      console.log("Failed to login", apiError.response?.data?.message);
    }
  }

  const promise = () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ name: "Sonner" }), 1000)
    );

  const showToast = () => {
    if (responseStatus === 201) {
      toast.promise(promise, {
        loading: "Loading...",
        success: () => {
          navigate("/");
          return `Sua conta foi criada!`;
        },
        error: "Error",
      });
    }
  };

  useEffect(() => {
    showToast();
  }, [responseStatus]);

  return {
    error,
    onSubmit,
    form,
  };
};
