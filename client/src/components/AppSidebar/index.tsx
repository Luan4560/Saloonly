import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "@/lib/api/axios";
import { useAuthStore } from "@/stores/authStore";
import {
  Calendar,
  Home,
  Building2,
  Scissors,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const allItems = [
  { title: "Início", url: "/dashboard", icon: Home },
  { title: "Estabelecimentos", url: "/establishments", icon: Building2 },
  { title: "Serviços", url: "/services", icon: Scissors },
  { title: "Colaboradores", url: "/collaborators", icon: Users },
  { title: "Agendamentos", url: "/appointments", icon: Calendar },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const establishmentId = useAuthStore((state) => state.establishmentId);
  const items = establishmentId
    ? allItems
    : allItems.filter((item) => item.url !== "/establishments");

  async function handleLogout() {
    try {
      await api.delete("/admin/users/logout");
    } finally {
      useAuthStore.getState().logout();
      navigate("/", { replace: true });
    }
  }

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-5 mt-10">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <span className="flex shrink-0 [&_svg]:size-5">
                        <item.icon />
                      </span>
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
