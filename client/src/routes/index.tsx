import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/protectedRoutes";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Establishments = lazy(() => import("@/pages/Establishments"));
const RegisterEstablishment = lazy(
  () => import("@/pages/RegisterEstablishment")
);
const Services = lazy(() => import("@/pages/Services"));
const Collaborators = lazy(() => import("@/pages/Collaborators"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const Settings = lazy(() => import("@/pages/Settings"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));

export default function AppRoutes() {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/register-establishment" element={<RegisterEstablishment />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/establishments" element={<Establishments />} />
            <Route path="/services" element={<Services />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
