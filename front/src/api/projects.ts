import api from "./axiosInstance";
import type { ProjectCreateData, ProjectUpdateData } from "../types";

export const getProjects = () => api.get("/projects/");
export const createProject = (data: ProjectCreateData) => api.post("/projects/", data);
export const updateProject = (id: number, data: ProjectUpdateData) =>
  api.patch(`/projects/${id}/`, data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}/`);
export const transferOwnership = (id: number, newOwnerId: number) =>
  api.post(`/projects/${id}/transfer_ownership/`, { new_owner: newOwnerId });
