import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditProjectModal from "../components/EditProjectModal";
import CreateProjectModal from "../components/CreateProjectModal";
import api from "../api/axiosInstance";
import { useAuthContext } from "../context/auth";
import type { Project, User } from "../types";

import {
  Box,
  Heading,
  Button,
  Select,
  Text,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";

export default function Dashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

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
      return project.members_info.some((m) => m.user === user?.username && m.role === "manager");
    return true;
  });

  return (
    <Box maxW="6xl" mx="auto" px={4} py={8}>
      <Heading mb={6} color="brand.500" textAlign="center">
        Mes Projets
      </Heading>

      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Button colorScheme="blue" onClick={() => setCreatingProject(true)}>
          Créer un projet
        </Button>

        <Select
          maxW="250px"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">Tous les projets</option>
          <option value="owner">Chef de projet</option>
          <option value="member">Membre</option>
          <option value="manager">Manager</option>
        </Select>
      </HStack>

      {errorMessage && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              cursor="pointer"
              borderRadius="xl"
              boxShadow="sm"
              _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
              transition="all 0.2s"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <Heading size="md">{project.name}</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={2}>{project.description}</Text>
                <Text fontSize="sm" color="gray.600">
                  Propriétaire : <b>{project.owner}</b>
                </Text>
              </CardBody>
              <CardFooter>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(project);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project);
                    }}
                  >
                    Supprimer
                  </Button>
                </HStack>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

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
    </Box>
  );
}
