import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { PublicLayout } from "./PublicLayout";

export { PublicLayout };

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col min-h-screen w-full">
          <SidebarTrigger />
          <div className="flex-1">{children}</div>
          <footer className="border-t py-3 px-6 text-center text-sm text-muted-foreground">
            <Link to="/terms" className="hover:underline">
              Termos de Uso
            </Link>
            {" · "}
            <Link to="/privacy" className="hover:underline">
              Política de Privacidade
            </Link>
          </footer>
        </main>
      </SidebarProvider>
    </>
  );
};
