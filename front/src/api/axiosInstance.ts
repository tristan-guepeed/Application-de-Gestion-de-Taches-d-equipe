// src/api/axiosInstance.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Axios >= 1.x a des headers en AxiosHeaders → on utilise set()
      config.headers.set?.("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/users/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccess = (res.data as { access: string }).access;
          localStorage.setItem("accessToken", newAccess);

          // mettre à jour le header global
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

          // mettre à jour la requête originale
          originalRequest.headers.set?.("Authorization", `Bearer ${newAccess}`);

          return api(originalRequest); // retry
        } catch (err) {
          console.error("Erreur lors du refresh token :", err);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
