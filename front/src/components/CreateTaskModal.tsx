// src/components/CreateTaskModal.tsx
import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axiosInstance";
import type { Task, User, TaskPriority } from "../types";

interface CreateTaskModalProps {
  projectId: number;
  allUsers: User[];
  currentUserId: number;
  onClose: () => void;
  onCreate: (task: Task) => void;
}

export default function CreateTaskModal({
  projectId,
  allUsers,
  currentUserId,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("LOW");
  const [assignees, setAssignees] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAssigneeToggle = (userId: number) => {
    setAssignees(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post<Task>("/tasks/", {
        project: projectId,
        title,
        description,
        priority,
        assignees,
        due_date: dueDate,
      });
      onCreate(res.data);
      onClose();
    } catch {
      setErrorMessage("Erreur lors de la création de la tâche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Créer une tâche</h2>

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
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Priorité :</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
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
                />
                {u.username}
                {u.id === currentUserId ? " (Vous)" : ""}
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
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
