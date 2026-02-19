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
  getCollaborators,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  getEstablishments,
  type Collaborator,
} from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const collaboratorFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  avatar: z.string().optional(),
});

type CollaboratorFormValues = z.infer<typeof collaboratorFormSchema>;

export default function Collaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [establishments, setEstablishments] = useState<{ id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      avatar: "",
    },
  });

  async function load() {
    try {
      setLoading(true);
      const [collaboratorsData, establishmentsData] = await Promise.all([
        getCollaborators(),
        getEstablishments(),
      ]);
      setCollaborators(Array.isArray(collaboratorsData) ? collaboratorsData : []);
      setEstablishments(Array.isArray(establishmentsData) ? establishmentsData : []);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values: CollaboratorFormValues) {
    const establishmentId = establishments[0]?.id;
    if (!establishmentId && !editingId) {
      toast.error("Cadastre um estabelecimento primeiro.");
      return;
    }
    try {
      if (editingId) {
        await updateCollaborator(editingId, {
          name: values.name,
          phone: values.phone,
          email: values.email,
          avatar: values.avatar || undefined,
          establishment_id: establishmentId,
        });
        toast.success("Colaborador atualizado.");
      } else {
        await createCollaborator({
          name: values.name,
          phone: values.phone,
          email: values.email,
          avatar: values.avatar || undefined,
          establishment_id: establishmentId,
        });
        toast.success("Colaborador criado.");
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
    if (!window.confirm("Excluir este colaborador?")) return;
    try {
      await deleteCollaborator(id);
      toast.success("Colaborador excluído.");
      load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  function openEdit(c: Collaborator) {
    setEditingId(c.id);
    form.reset({
      name: c.name,
      phone: c.phone,
      email: c.email,
      avatar: c.avatar ?? "",
    });
    setSheetOpen(true);
  }

  function openCreate() {
    setEditingId(null);
    form.reset({ name: "", phone: "", email: "", avatar: "" });
    setSheetOpen(true);
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Colaboradores</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a equipe do estabelecimento.
            </p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo colaborador
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto p-6">
              <SheetHeader>
                <SheetTitle>
                  {editingId ? "Editar colaborador" : "Novo colaborador"}
                </SheetTitle>
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
                          <Input placeholder="Nome completo" {...field} />
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
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
        ) : collaborators.length === 0 ? (
          <p className="text-muted-foreground mt-6">
            Nenhum colaborador cadastrado.
          </p>
        ) : (
          <div className="mt-6 rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">Telefone</th>
                  <th className="text-left p-3 font-medium">E-mail</th>
                  <th className="p-3 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {collaborators.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
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
