import React from "react";
import { AuthContext, type User } from "./auth";
import api from "../api/axiosInstance";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = React.useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) return;
      try {
        const res = await api.get<User>("/users/me/");
        setUser(res.data);
      } catch {
        logout();
      }
    };

    fetchUser().finally(() => setLoading(false));
  }, [accessToken]);


  const login = async (username: string, password: string) => {
    const res = await api.post("/users/token/", { username, password });
    setAccessToken(res.data.access);
    localStorage.setItem("accessToken", res.data.access);
    localStorage.setItem("refreshToken", res.data.refresh);

    const userRes = await api.get<User>("/users/me/");
    setUser(userRes.data);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
