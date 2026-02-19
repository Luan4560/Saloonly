import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useRef, useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const establishmentId = useAuthStore((state) => state.establishmentId);
  const setEstablishmentId = useAuthStore((state) => state.setEstablishmentId);
  const location = useLocation();
  const hasCheckedMeRef = useRef(false);
  const [isSyncingMe, setIsSyncingMe] = useState(false);

  const needsSync =
    isAuthenticated &&
    !establishmentId &&
    location.pathname !== "/register-establishment";

  useEffect(() => {
    if (!needsSync || hasCheckedMeRef.current) return;
    hasCheckedMeRef.current = true;
    setIsSyncingMe(true);
    getMe()
      .then((user) => {
        if (user.establishment_id) {
          setEstablishmentId(user.establishment_id);
        }
      })
      .finally(() => {
        setIsSyncingMe(false);
      });
  }, [needsSync, setEstablishmentId]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (establishmentId) {
    return <Outlet />;
  }
  if (location.pathname === "/register-establishment") {
    return <Outlet />;
  }
  if (isSyncingMe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }
  return <Navigate to="/register-establishment" replace />;
};