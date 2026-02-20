import type { ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useClientAuthStore } from "@/stores/clientAuthStore";
import { clientLogout } from "@/lib/api/clientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { LogIn, LogOut, Search, Scissors, User, UserPlus } from "lucide-react";

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate();
  const accessToken = useClientAuthStore((s) => s.accessToken);
  const user = useClientAuthStore((s) => s.user);
  const logout = useClientAuthStore((s) => s.logout);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!accessToken;
  const displayName = user?.name?.trim() || user?.email || "Cliente";

  const handleLogout = () => {
    clientLogout().finally(() => {
      logout();
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/booking?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/booking");
    }
    setSearchOpen(false);
  };

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 supports-backdrop-filter:bg-background/80 backdrop-blur">
        <div className="w-full max-w-5xl  mx-auto flex h-14 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/booking"
            className="flex shrink-0 items-center gap-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            aria-label="Saloonly - Ir para busca"
          >
            <Scissors className="size-7 " aria-hidden />
            <span className="font-semibold text-base sm:text-lg tracking-tight">
              Saloonly
            </span>
          </Link>

          {/* Search: expandable on mobile, always visible on desktop */}
          <form
            onSubmit={handleSearch}
            className={cn(
              "flex flex-1 items-center justify-center",
              "max-w-md w-full",
              searchOpen ? "flex" : "hidden sm:flex",
            )}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar negócios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setSearchOpen(false)}
                className="h-9 w-full pl-9 pr-3 text-sm bg-muted/50 border-border"
                aria-label="Buscar negócios"
              />
            </div>
          </form>

          {/* Mobile search trigger when search bar is hidden */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden shrink-0"
            onClick={openSearch}
            aria-label="Abrir busca"
          >
            <Search className="size-5" />
          </Button>

          {/* Auth */}
          <nav
            className="flex shrink-0 items-center gap-1 sm:gap-2"
            aria-label="Conta e autenticação"
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/my/appointments"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <User className="size-4 shrink-0" aria-hidden />
                  <span className="hidden max-w-[120px] truncate capitalize sm:inline">
                    {displayName}
                  </span>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="gap-1.5">
                  <Link to="/client/login">
                    <LogIn className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Entrar</span>
                  </Link>
                </Button>
                <Button size="sm" asChild className="gap-1.5">
                  <Link to="/client/signup">
                    <UserPlus className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Cadastrar</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children ?? <Outlet />}</main>

      <footer className="border-t border-border bg-muted/30 py-6 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Saloonly. Agende com facilidade.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
