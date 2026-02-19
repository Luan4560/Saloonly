import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getEstablishments,
  updateEstablishment,
  deleteEstablishment,
  type Establishment,
} from "@/lib/api";

const establishmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().optional(),
  image: z.string().min(1, "URL da imagem é obrigatória"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Senha com no mínimo 6 caracteres",
    }),
});

type EstablishmentFormValues = z.infer<typeof establishmentFormSchema>;

export default function Establishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      image: "",
      password: "",
    },
  });

  async function load() {
    try {
      setLoading(true);
      const data = await getEstablishments();
      setEstablishments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar estabelecimentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values: EstablishmentFormValues) {
    if (!editingId) return;
    try {
      await updateEstablishment(editingId, {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        image: values.image,
      });
      toast.success("Estabelecimento atualizado.");
      setSheetOpen(false);
      setEditingId(null);
      form.reset();
      load();
    } catch (e: unknown) {
      const err = e as {
        response?: { status?: number; data?: { message?: string } };
      };
      toast.error(err.response?.data?.message ?? "Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este estabelecimento?")) return;
    try {
      await deleteEstablishment(id);
      toast.success("Estabelecimento excluído.");
      load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  function openEdit(e: Establishment) {
    setEditingId(e.id);
    form.reset({
      name: e.name,
      phone: e.phone,
      email: e.email,
      address: e.address,
      description: e.description ?? "",
      image: e.image,
      password: "",
    });
    setSheetOpen(true);
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Estabelecimentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus estabelecimentos.
            </p>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" className="overflow-y-auto p-6">
              <SheetHeader>
                <SheetTitle>Editar estabelecimento</SheetTitle>
              </SheetHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do estabelecimento"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
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
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da imagem</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://..."
                              {...field}
                              onPaste={(e) => {
                                const text =
                                  e.clipboardData.getData("text/plain");
                                if (text) field.onChange(text);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard
                                  .readText()
                                  .then(field.onChange)
                                  .catch(() =>
                                    toast.error(
                                      "Não foi possível acessar a área de transferência.",
                                    ),
                                  );
                              }}
                            >
                              Colar
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!editingId && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Mín. 6 caracteres"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <Button type="submit" className="w-full">
                    {editingId ? "Salvar" : "Criar"}
                  </Button>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>

        {loading ? (
          <p className="text-muted-foreground mt-6">Carregando...</p>
        ) : establishments.length === 0 ? (
          <p className="text-muted-foreground mt-6">
            Nenhum estabelecimento cadastrado.
          </p>
        ) : (
          <div className="mt-6 rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">Telefone</th>
                  <th className="text-left p-3 font-medium">E-mail</th>
                  <th className="text-left p-3 font-medium">Endereço</th>
                  <th className="p-3 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3">{e.name}</td>
                    <td className="p-3">{e.phone}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3">{e.address}</td>
                    <td className="p-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
