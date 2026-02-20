import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ProtectedRoute, ClientProtectedRoute } from "@/components/protectedRoutes";
import { PublicLayout } from "@/components/layout";

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
const Search = lazy(() => import("@/pages/client/Search"));
const EstablishmentDetail = lazy(
  () => import("@/pages/client/EstablishmentDetail")
);
const BookingFlow = lazy(() => import("@/pages/client/BookingFlow"));
const ClientLogin = lazy(() => import("@/pages/client/ClientLogin"));
const ClientSignUp = lazy(() => import("@/pages/client/ClientSignUp"));
const MyAppointments = lazy(() => import("@/pages/client/MyAppointments"));

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

          {/* Public client routes (PublicLayout: no sidebar) */}
          <Route element={<PublicLayout />}>
            <Route path="/booking" element={<Search />} />
            <Route path="/booking/:id" element={<EstablishmentDetail />} />
            <Route path="/booking/:id/book" element={<BookingFlow />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/signup" element={<ClientSignUp />} />
            {/* Client protected routes (require client auth) */}
            <Route element={<ClientProtectedRoute />}>
              <Route path="/my" element={<Navigate to="/my/appointments" replace />} />
              <Route path="/my/appointments" element={<MyAppointments />} />
            </Route>
          </Route>

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
