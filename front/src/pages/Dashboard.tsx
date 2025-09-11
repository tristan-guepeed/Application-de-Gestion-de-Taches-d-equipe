import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- pour redirection
import EditProjectModal from "../components/EditProjectModal";
import CreateProjectModal from "../components/CreateProjectModal";
import api from "../api/axiosInstance";
import { useAuthContext } from "../context/auth";
import type { Project, User } from "../types";

export default function Dashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate(); // <-- hook pour redirection
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "owner" | "member" | "manager">("all");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get<Project[]>("/projects/");
      setProjects(res.data);
    } catch {
      setErrorMessage("Impossible de récupérer les projets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/users/");
      setAllUsers(res.data);
    } catch {
      setErrorMessage("Impossible de récupérer les utilisateurs");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setEditingProject(null);
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
    setCreatingProject(false);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;

    try {
      await api.delete(`/projects/${projectId}/`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch {
      setErrorMessage("Impossible de supprimer le projet");
    }
  };

  const handleEditClick = (project: Project) => {
    setErrorMessage(null);
    if (project.owner !== user?.username) {
      setErrorMessage("Vous n’avez pas les droits pour modifier ce projet");
      return;
    }
    setEditingProject(project);
  };

  const handleDeleteClick = (project: Project) => {
    setErrorMessage(null);
    if (project.owner !== user?.username) {
      setErrorMessage("Vous n’avez pas les droits pour supprimer ce projet");
      return;
    }
    handleDeleteProject(project.id);
  };

  const filteredProjects = projects.filter((project) => {
      if (filter === "all") {
      return (
        project.owner === user?.username ||
        project.members_info.some((m) =>
          ["owner", "manager", "member"].includes(m.role) &&
          m.user === user?.username
        )
      );
    }
    if (filter === "owner")
      return project.owner === user?.username;
    if (filter === "member")
      return project.members_info.some((m) => m.user === user?.username && m.role !== "owner" && m.role !== "manager");
    if (filter === "manager")
      return project.members_info.some((m) => m.user === user?.username && (m.role === "manager"));
    return true;
  });


  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      <h1>Mes projets</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button onClick={() => setCreatingProject(true)}>Créer un projet</button>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "owner" | "member" | "manager")}>
          <option value="all">Tous les projets</option>
          <option value="owner">Chef de projet</option>
          <option value="member">Membre du projet</option>
          <option value="manager">Manager du projet</option>
        </select>
      </div>

      {errorMessage && (
        <div style={{ color: "red", marginBottom: 10 }}>{errorMessage}</div>
      )}

      {loading && <p>Chargement...</p>}

      {filteredProjects.map((project) => (
        <div
          key={project.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 5,
            padding: 10,
            marginBottom: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <p>
            Propriétaire : <strong>{project.owner}</strong>
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(project);
            }}
          >
            Modifier
          </button>{" "}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(project);
            }}
          >
            Supprimer
          </button>
        </div>
      ))}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          allUsers={allUsers}
          onClose={() => setEditingProject(null)}
          onUpdate={handleUpdateProject}
        />
      )}

      {creatingProject && user && (
        <CreateProjectModal
          allUsers={allUsers}
          currentUserId={user.id}
          onClose={() => setCreatingProject(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
