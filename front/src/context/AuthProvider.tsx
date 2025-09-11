// src/context/AuthProvider.tsx
import React from "react";
import { AuthContext } from "./auth";
import api from "../api/axiosInstance";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = React.useState<string | null>(
    localStorage.getItem("accessToken")
  );

  const login = async (username: string, password: string) => {
    const res = await api.post("/users/token/", { username, password });
    setAccessToken(res.data.access);

    localStorage.setItem("accessToken", res.data.access);
    localStorage.setItem("refreshToken", res.data.refresh);
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
