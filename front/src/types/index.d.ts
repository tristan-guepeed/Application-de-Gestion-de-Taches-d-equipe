// Project
export interface ProjectMemberData {
  id: number;
  role: "manager" | "member" | string;
}

export interface ProjectCreateData {
  name: string;
  description: string;
  members: ProjectMemberData[];
}

export type ProjectUpdateData = Partial<ProjectCreateData>;

// Task
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TaskCreateData {
  project: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: number[];
  due_date: string;
}

export type TaskUpdateData = Partial<TaskCreateData>;

export interface Task {
  id: number;
  project: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees_info: User[];
  due_date: string;
  created_by: number;
}

// Projet
export interface ProjectMemberInfo {
  id: number;
  user: string;
  role: "owner" | "manager" | "member";
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: string;
  owner_id: number;
  members_info: ProjectMemberInfo[];
  created_at?: string;
  updated_at?: string;
}

// Utilisateur
export interface User {
  id: number;
  username: string;
}

