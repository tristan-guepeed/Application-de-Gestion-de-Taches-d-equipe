import React from "react";

export type AuthContextType = {
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
