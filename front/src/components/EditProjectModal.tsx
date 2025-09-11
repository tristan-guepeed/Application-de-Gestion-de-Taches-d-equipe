import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axiosInstance";
import type { Project, User } from "../types";
import type { AxiosError } from "axios";

type ProjectMember = {
  id: number;
  user: string;
  role: "owner" | "manager" | "member";
  user_id?: number;
};

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (updated: Project) => void;
  allUsers: User[];
}

export default function EditProjectModal({
  project,
  onClose,
  onUpdate,
  allUsers,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  const initialMembers: ProjectMember[] = project.members_info.map((m) => {
    const user = allUsers.find((u) => u.username === m.user);
    return {
      ...m,
      user_id: user?.id,
    };
  });

  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [newOwnerId, setNewOwnerId] = useState<number>(project.owner_id);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleChange = (user_id: number, role: ProjectMember["role"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.user_id === user_id ? { ...m, role } : m))
    );
  };

  const handleRemoveMember = (user_id: number) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== user_id));
  };

  const handleAddMember = (user_id: number, role: ProjectMember["role"]) => {
    const user = allUsers.find((u) => u.id === user_id);
    if (!user) return;
    if (members.some((m) => m.user_id === user_id)) return;
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: user.username,
        user_id: user.id,
        role,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const membersToSend = members
        .filter((m) => m.role !== "owner") // exclure le owner pour l’update
        .map((m) => ({
          id: m.user_id,
          role: m.role,
        }));

      await api.patch(`/projects/${project.id}/`, {
        name,
        description,
        members: membersToSend,
      });

      if (newOwnerId !== project.owner_id) {
        await api.post(`/projects/${project.id}/transfer_ownership/`, {
          new_owner_id: newOwnerId,
        });
      }

      const updatedProject = await api.get<Project>(`/projects/${project.id}/`);
      onUpdate(updatedProject.data);
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      if (error.response) {
        if (error.response.status === 403) {
          setErrorMessage("Vous n’avez pas les droits pour modifier ce projet");
        } else if (error.response.data.detail) {
          setErrorMessage(error.response.data.detail);
        } else {
          setErrorMessage("Une erreur est survenue");
        }
      } else {
        setErrorMessage("Erreur réseau");
      }
    } finally {
      setLoading(false);
    }
  };

  // Membres éditables (sans le owner)
  const editableMembers = members.filter((m) => m.role !== "owner");

  return (
    <Modal onClose={onClose}>
      <h2>Modifier le projet</h2>

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
          {editableMembers.map((m) => (
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
                  handleRoleChange(m.user_id!, e.target.value as ProjectMember["role"])
                }
              >
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
              <button type="button" onClick={() => handleRemoveMember(m.user_id!)}>
                X
              </button>
            </div>
          ))}

          <div style={{ marginTop: 5 }}>
            <select id="add-user">
              <option value="">Choisir un utilisateur</option>
              {allUsers
                .filter((u) => !members.some((m) => m.user_id === u.id))
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
                const userSelect = document.getElementById(
                  "add-user"
                ) as HTMLSelectElement;
                const roleSelect = document.getElementById(
                  "add-role"
                ) as HTMLSelectElement;
                if (!userSelect.value) return;
                handleAddMember(
                  Number(userSelect.value),
                  roleSelect.value as ProjectMember["role"]
                );
                userSelect.value = "";
                roleSelect.value = "member";
              }}
            >
              Ajouter
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <h3>Transférer propriétaire</h3>
          <select
            value={newOwnerId}
            onChange={(e) => setNewOwnerId(Number(e.target.value))}
          >
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.user}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Modification..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
