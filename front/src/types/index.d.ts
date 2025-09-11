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

// Pour update on peut rendre tout optionnel
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
  due_date: string; // format YYYY-MM-DD
}

// Update est partiel
export type TaskUpdateData = Partial<TaskCreateData>;
