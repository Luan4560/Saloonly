import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  establishment_id?: string | null;
}

function getEstablishmentIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return payload.establishment_id ?? null;
  } catch {
    return null;
  }
}

interface AuthState {
  accessToken: string | null;
  establishmentId: string | null;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: ApiError | null;
  login: (token: string, user?: AuthUser | null) => void;
  logout: () => void;
  setEstablishmentId: (id: string | null) => void;
  setHasHydrated: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ApiError) => void;
}

interface ApiError extends Error {
  response?: {
    data: {
      message: string;
    };
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      establishmentId: null,
      hasHydrated: false,
      loading: false,
      error: null,
      login: (token: string, user?: AuthUser | null) =>
        set({
          accessToken: token,
          establishmentId:
            user?.establishment_id ?? getEstablishmentIdFromToken(token) ?? null,
        }),
      logout: () => set({ accessToken: null, establishmentId: null }),
      setEstablishmentId: (id: string | null) => set({ establishmentId: id }),
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: ApiError) => set({ error }),
      get isAuthenticated() {
        return !!this.accessToken;
      },
    }),
    {
      name: "auth-admin",
      partialize: (state) => ({
        accessToken: state.accessToken,
        establishmentId: state.establishmentId,
      }),
      onRehydrateStorage: () => (state) => {
        useAuthStore.getState().setHasHydrated(true);
        if (state?.accessToken && state.establishmentId == null) {
          const id = getEstablishmentIdFromToken(state.accessToken);
          if (id) useAuthStore.setState({ establishmentId: id });
        }
      },
    }
  )
);
