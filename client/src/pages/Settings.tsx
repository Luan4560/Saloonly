import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getMe, updateProfile } from "@/lib/api/auth";
import type { AuthUser } from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const profileFormSchema = z
  .object({
    name: z.string().optional(),
    email: z
      .union([z.string().email("E-mail inválido"), z.literal("")])
      .optional(),
  })
  .refine(
    (data) =>
      (data.name ?? "").trim() !== "" || (data.email ?? "").trim() !== "",
    {
      message: "Envie ao menos um campo: nome ou e-mail",
      path: ["name"],
    },
  );

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Settings() {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMe();
        if (!cancelled) {
          setProfile(data);
          form.reset({
            name: data.name ?? "",
            email: data.email ?? "",
          });
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        if (!cancelled) {
          setError(err.response?.data?.message ?? "Erro ao carregar perfil");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load profile once on mount
  }, []);

  async function onSubmit(values: ProfileFormValues) {
    const name = values.name?.trim();
    const email = values.email?.trim();
    const body: { name?: string; email?: string } = {};
    if (name) body.name = name;
    if (email) body.email = email;
    if (Object.keys(body).length === 0) {
      toast.error("Altere nome ou e-mail para salvar.");
      return;
    }
    try {
      const updated = await updateProfile(body);
      setProfile(updated);
      toast.success("Perfil atualizado.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Erro ao atualizar perfil");
    }
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Preferências da conta e do painel.
        </p>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Perfil da conta</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : profile ? (
            <>
              <div className="max-w-md rounded-md border bg-muted/30 p-4 text-sm">
                <p>
                  <span className="font-medium">Nome:</span>{" "}
                  {profile.name ?? "—"}
                </p>
                <p className="mt-1">
                  <span className="font-medium">E-mail:</span>{" "}
                  {profile.email ?? "—"}
                </p>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="max-w-md space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={profile.name ?? "Seu nome"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={profile.email ?? "seu@email.com"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Salvar alterações</Button>
                </form>
              </Form>
            </>
          ) : null}
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Legal</h2>
          <p className="text-sm text-muted-foreground">
            <Link to="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>
            {" · "}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </section>
      </div>
    </Layout>
  );
}
