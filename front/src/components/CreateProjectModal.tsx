// src/components/CreateProjectModal.tsx
import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axiosInstance";
import type { User, Project } from "../types";
import type { AxiosError } from "axios";

type ProjectMember = {
  id: number;
  user: string;
  role: "manager" | "member";
  user_id: number;
};

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (newProject: Project) => void;
  allUsers: User[];
  currentUserId: number; // id de l'utilisateur connecté
}

export default function CreateProjectModal({
  onClose,
  onCreate,
  allUsers,
  currentUserId,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddMember = (user_id: number, role: ProjectMember["role"]) => {
    const user = allUsers.find((u) => u.id === user_id);
    if (!user) return;
    if (members.some((m) => m.user_id === user_id)) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), user: user.username, user_id: user.id, role },
    ]);
  };

  const handleRemoveMember = (user_id: number) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== user_id));
  };

  const handleRoleChange = (user_id: number, role: ProjectMember["role"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.user_id === user_id ? { ...m, role } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const membersToSend = members.map((m) => ({
        id: m.user_id,
        role: m.role,
      }));

      const res = await api.post<Project>("/projects/", {
        name,
        description,
        members: membersToSend,
      });

      onCreate(res.data);
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      if (error.response) {
        setErrorMessage(error.response.data.detail || "Une erreur est survenue");
      } else {
        setErrorMessage("Erreur réseau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Créer un projet</h2>

      {errorMessage && (
        <div style={{ color: "red", marginBottom: 10 }}>{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du projet"
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <h3>Membres</h3>
          {members.map((m) => (
            <div
              key={m.user_id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <span>{m.user}</span>
              <select
                value={m.role}
                onChange={(e) =>
                  handleRoleChange(m.user_id, e.target.value as ProjectMember["role"])
                }
              >
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
              <button type="button" onClick={() => handleRemoveMember(m.user_id)}>
                X
              </button>
            </div>
          ))}

          <div style={{ marginTop: 5 }}>
            <select id="add-user">
              <option value="">Choisir un utilisateur</option>
              {allUsers
                .filter((u) => u.id !== currentUserId && !members.some((m) => m.user_id === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>
            <select id="add-role">
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const userSelect = document.getElementById("add-user") as HTMLSelectElement;
                const roleSelect = document.getElementById("add-role") as HTMLSelectElement;
                if (!userSelect.value) return;
                handleAddMember(Number(userSelect.value), roleSelect.value as ProjectMember["role"]);
                userSelect.value = "";
                roleSelect.value = "member";
              }}
            >
              Ajouter
            </button>
          </div>
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
