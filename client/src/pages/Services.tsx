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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getEstablishments,
  type Service,
} from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const serviceFormSchema = z.object({
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().int().positive(),
  active: z.boolean().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [establishments, setEstablishments] = useState<{ id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      description: "",
      price: 0,
      duration: 30,
      active: true,
    },
  });

  async function load() {
    try {
      setLoading(true);
      const [servicesData, establishmentsData] = await Promise.all([
        getServices(),
        getEstablishments(),
      ]);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setEstablishments(
        Array.isArray(establishmentsData) ? establishmentsData : [],
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values: ServiceFormValues) {
    const establishmentId = establishments[0]?.id;
    if (!establishmentId && !editingId) {
      toast.error("Cadastre um estabelecimento primeiro.");
      return;
    }
    try {
      if (editingId) {
        await updateService(editingId, {
          description: values.description,
          price: values.price,
          duration: values.duration,
          active: values.active,
        });
        toast.success("Serviço atualizado.");
      } else {
        await createService({
          description: values.description,
          price: values.price,
          duration: values.duration,
          establishment_id: establishmentId,
        });
        toast.success("Serviço criado.");
      }
      setSheetOpen(false);
      setEditingId(null);
      form.reset();
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este serviço?")) return;
    try {
      await deleteService(id);
      toast.success("Serviço excluído.");
      load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  function openEdit(service: Service) {
    setEditingId(service.id);
    form.reset({
      description: service.description ?? "",
      price: Number(service.price),
      duration: service.duration,
      active: service.active,
    });
    setSheetOpen(true);
  }

  function openCreate() {
    setEditingId(null);
    form.reset({
      description: "",
      price: 0,
      duration: 30,
      active: true,
    });
    setSheetOpen(true);
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Serviços</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os serviços oferecidos.
            </p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo serviço
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto p-6">
              <SheetHeader>
                <SheetTitle>
                  {editingId ? "Editar serviço" : "Novo serviço"}
                </SheetTitle>
              </SheetHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Corte de cabelo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (min)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {editingId && (
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Ativo</FormLabel>
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
        ) : services.length === 0 ? (
          <p className="text-muted-foreground mt-6">
            Nenhum serviço cadastrado. Cadastre um estabelecimento e adicione
            serviços ou use o botão acima.
          </p>
        ) : (
          <div className="mt-6 rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Descrição</th>
                  <th className="text-left p-3 font-medium">Preço</th>
                  <th className="text-left p-3 font-medium">Duração</th>
                  <th className="text-left p-3 font-medium">Tipo</th>
                  <th className="text-left p-3 font-medium">Ativo</th>
                  <th className="p-3 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{s.description ?? "-"}</td>
                    <td className="p-3">R$ {Number(s.price).toFixed(2)}</td>
                    <td className="p-3">{s.duration} min</td>
                    <td className="p-3">
                      {s.establishment_type === "BARBERSHOP"
                        ? "Barbearia"
                        : "Salão"}
                    </td>
                    <td className="p-3">{s.active ? "Sim" : "Não"}</td>
                    <td className="p-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(s.id)}
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
