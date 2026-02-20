import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ClientAuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface ClientAuthState {
  accessToken: string | null;
  user: ClientAuthUser | null;
  login: (token: string, user: ClientAuthUser | null) => void;
  logout: () => void;
}

export const useClientAuthStore = create<ClientAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      login: (token: string, user: ClientAuthUser | null) =>
        set({ accessToken: token, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-client",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
