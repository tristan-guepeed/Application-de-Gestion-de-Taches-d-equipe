import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axiosInstance";
import type { Task, User, TaskPriority } from "../types";
import type { AxiosError } from "axios";

interface EditTaskModalProps {
  task: Task;
  projectOwnerId: number;
  currentUserId: number;
  allUsers: User[];
  onClose: () => void;
  onUpdate: (updated: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function EditTaskModal({
  task,
  projectOwnerId,
  currentUserId,
  allUsers,
  onClose,
  onUpdate,
  onDelete,
}: EditTaskModalProps) {
  const canEdit = currentUserId === projectOwnerId || currentUserId === task.created_by;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignees, setAssignees] = useState<number[]>(task.assignees_info.map(a => a.id));
  const [dueDate, setDueDate] = useState(task.due_date);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAssigneeToggle = (userId: number) => {
    setAssignees(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const updatedData = {
        title,
        description,
        priority,
        assignees,
        due_date: dueDate,
      };
      const res = await api.patch<Task>(`/tasks/${task.id}/`, updatedData);
      onUpdate(res.data);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      setErrorMessage(error.response?.data.detail || "Erreur lors de la modification de la tâche");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    if (!confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;

    try {
      await api.delete(`/tasks/${task.id}/`);
      onDelete(task.id);
      onClose();
    } catch {
      setErrorMessage("Impossible de supprimer la tâche");
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Modifier la tâche</h2>

      {errorMessage && <div style={{ color: "red", marginBottom: 10 }}>{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titre"
            style={{ width: "100%", padding: 8 }}
            required
            disabled={!canEdit}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            style={{ width: "100%", padding: 8 }}
            required
            disabled={!canEdit}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Priorité :</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            disabled={!canEdit}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Assignés :</label>
          <div>
            {allUsers.map(u => (
              <label key={u.id} style={{ marginRight: 10 }}>
                <input
                  type="checkbox"
                  checked={assignees.includes(u.id)}
                  onChange={() => handleAssigneeToggle(u.id)}
                  disabled={!canEdit}
                />
                {u.username}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Date limite :</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          {canEdit && (
            <button type="button" onClick={handleDelete} disabled={loading}>
              Supprimer
            </button>
          )}
          <button type="button" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          {canEdit && (
            <button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Enregistrer"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
