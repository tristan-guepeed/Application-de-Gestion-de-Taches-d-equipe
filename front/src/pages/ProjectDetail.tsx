// src/pages/ProjectDetail.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuthContext } from "../context/auth";
import type { Project, Task, User, TaskStatus, TaskPriority } from "../types";
import EditTaskModal from "../components/EditTaskModal";
import CreateTaskModal from "../components/CreateTaskModal";

const priorityColors: Record<TaskPriority, string> = {
  LOW: "#d3f9d8",
  MEDIUM: "#fff3bf",
  HIGH: "#ffc9c9",
  CRITICAL: "#ff6b6b",
};

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthContext();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Fetch projet et tâches
  const fetchProjectAndTasks = useCallback(async () => {
    if (!projectId) {
      setErrorMessage("ID de projet manquant");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const projectRes = await api.get<Project>(`/projects/${projectId}/`);
      setProject(projectRes.data);

      const tasksRes = await api.get<Task[]>(`/tasks/?project_id=${projectId}`);
      setTasks(tasksRes.data);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<User[]>("/users/");
      setAllUsers(res.data);
    } catch {
      setErrorMessage("Impossible de récupérer les utilisateurs");
    }
  }, []);

  useEffect(() => {
    fetchProjectAndTasks();
    fetchUsers();
  }, [fetchProjectAndTasks, fetchUsers]);

  // Tri des tâches par status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };
  tasks.forEach((task) => tasksByStatus[task.status].push(task));

  // Droits d'édition/suppression
  const canEditOrDelete = (task: Task) => {
    if (!project || !user) return false;
    return project.owner === user.username || task.created_by === user.id;
  };

  // Changement de status via drag & drop
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await api.patch(`/tasks/${task.id}/`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch {
      setErrorMessage("Impossible de mettre à jour le status de la tâche");
    }
  };

  // Suppression
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
    try {
      await api.delete(`/tasks/${taskId}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      setErrorMessage("Impossible de supprimer la tâche");
    }
  };

  // Mise à jour d'une tâche
  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  if (loading) return <p>Chargement...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;
  if (!project) return <p>Projet introuvable</p>;

  return (
    <div>
      <h1>{project.name}</h1>
      <button onClick={() => setCreatingTask(true)} style={{ marginBottom: 20 }}>
        Créer une tâche
      </button>

      <div style={{ display: "flex", gap: 20 }}>
        {Object.keys(tasksByStatus).map((statusKey) => {
          const status = statusKey as TaskStatus;
          return (
            <div
              key={status}
              style={{ flex: 1 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTask && draggedTask.status !== status) {
                  handleStatusChange(draggedTask, status);
                  setDraggedTask(null);
                }
              }}
            >
              <h3>{status.replace("_", " ")}</h3>
              {tasksByStatus[status].map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: priorityColors[task.priority as TaskPriority],
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                    cursor: canEditOrDelete(task) ? "grab" : "default",
                  }}
                  draggable={canEditOrDelete(task)}
                  onDragStart={() => setDraggedTask(task)}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p>Priority: {task.priority}</p>
                  <p>
                    Assignees: {task.assignees_info?.map((a) => a.username).join(", ")}
                  </p>
                  {canEditOrDelete(task) && (
                    <div>
                      <button onClick={() => setEditingTask(task)}>Modifier</button>{" "}
                      <button onClick={() => handleDeleteTask(task.id)}>Supprimer</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      {editingTask && user && (
        <EditTaskModal
          task={editingTask}
          projectOwnerId={project.owner_id}
          currentUserId={user.id}
          allUsers={allUsers}
          onClose={() => setEditingTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Create Task Modal */}
      {creatingTask && project && (
        <CreateTaskModal
          currentUserId={user ? user.id : 0}
          projectId={project.id}
          allUsers={allUsers}
          onClose={() => setCreatingTask(false)}
          onCreate={(newTask) => {
            setTasks((prev) => [...prev, newTask]);
            setCreatingTask(false);
          }}
        />
      )}
    </div>
  );
}
