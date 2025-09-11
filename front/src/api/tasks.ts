import api from "./axiosInstance";
import type { TaskCreateData, TaskUpdateData } from "../types";

export const getTasks = (filters?: string) =>
  api.get(`/tasks/${filters ? `?${filters}` : ""}`);
export const getTaskById = (id: number) => api.get(`/tasks/${id}/`);
export const createTask = (data: TaskCreateData) => api.post("/tasks/", data);
export const updateTask = (id: number, data: TaskUpdateData) =>
  api.patch(`/tasks/${id}/`, data); // PATCH pour update partiel
export const deleteTask = (id: number) => api.delete(`/tasks/${id}/`);
