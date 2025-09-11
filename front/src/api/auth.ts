import api from "./axiosInstance";

export const loginUser = (username: string, password: string) =>
  api.post("/users/token/", { username, password });

export const registerUser = (username: string, password: string) =>
  api.post("/users/register/", { username, password });

export const getUsers = () => api.get("/users/");
