import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuthContext } from "../context/auth";
import type { Project, Task, User, TaskStatus, TaskPriority } from "../types";
import EditTaskModal from "../components/EditTaskModal";
import CreateTaskModal from "../components/CreateTaskModal";
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Badge,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

const priorityColors: Record<TaskPriority, string> = {
  LOW: "green.100",
  MEDIUM: "yellow.100",
  HIGH: "orange.200",
  CRITICAL: "red.300",
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
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const toast = useToast();

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

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };
  tasks.forEach((task) => tasksByStatus[task.status].push(task));

  const canEditOrDelete = (task: Task) => {
    if (!project || !user) return false;
    return project.owner === user.username || task.created_by === user.id;
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await api.patch(`/tasks/${task.id}/`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
      toast({ title: "Tâche mise à jour", status: "success", duration: 2000, isClosable: true });
    } catch {
      setErrorMessage("Impossible de mettre à jour le statut de la tâche");
    }
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  if (loading)
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" />
      </Flex>
    );

  if (errorMessage)
    return (
      <Alert status="error">
        <AlertIcon />
        {errorMessage}
      </Alert>
    );

  if (!project) return <Text>Projet introuvable</Text>;

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">{project.name}</Heading>

        <HStack spacing={4}>
          <Select
            size="sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
            minW="150px"
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </Select>

          <Button colorScheme="blue" onClick={() => setCreatingTask(true)} flexShrink={0}>
            Créer une tâche
          </Button>
        </HStack>
      </Flex>

      <Flex gap={6} align="flex-start">
        {Object.keys(tasksByStatus).map((statusKey) => {
          const status = statusKey as TaskStatus;
          return (
            <VStack
              key={status}
              flex="1"
              spacing={4}
              p={4}
              bg="gray.50"
              borderRadius="lg"
              minH="300px"
              align="stretch"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTask && draggedTask.status !== status) {
                  handleStatusChange(draggedTask, status);
                  setDraggedTask(null);
                }
              }}
            >
              <Heading size="md" textAlign="center">
                {status === "TODO" ? "À faire" : status === "IN_PROGRESS" ? "En cours" : "Terminé"}
              </Heading>

              {tasksByStatus[status]
                .filter((task) => priorityFilter === "ALL" || task.priority === priorityFilter)
                .map((task) => (
                  <Box
                    key={task.id}
                    bg={priorityColors[task.priority as TaskPriority]}
                    p={3}
                    borderRadius="md"
                    boxShadow="sm"
                    cursor={canEditOrDelete(task) ? "grab" : "default"}
                    draggable={canEditOrDelete(task)}
                    onDragStart={() => setDraggedTask(task)}
                  >
                    <Heading size="sm">{task.title}</Heading>
                    <Text fontSize="sm" noOfLines={3}>
                      {task.description}
                    </Text>
                    <HStack justify="space-between" mt={2}>
                      <Badge colorScheme="purple">{task.priority}</Badge>
                      <Text fontSize="xs" color="gray.600">
                        {task.assignees_info?.map((a) => a.username).join(", ")}
                      </Text>
                    </HStack>

                    {canEditOrDelete(task) && (
                      <HStack mt={2} spacing={2}>
                        <Button size="xs" colorScheme="blue" onClick={() => setEditingTask(task)}>
                          Modifier
                        </Button>
                        <Button size="xs" colorScheme="red" onClick={() => setTaskToDelete(task)}>
                          Supprimer
                        </Button>
                      </HStack>
                    )}
                  </Box>
                ))}
            </VStack>
          );
        })}
      </Flex>

      <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmer la suppression</ModalHeader>
          <ModalBody>
            <Text>
              Voulez-vous vraiment supprimer la tâche <b>{taskToDelete?.title}</b> ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setTaskToDelete(null)}>
              Annuler
            </Button>
            <Button
              colorScheme="red"
              onClick={async () => {
                if (!taskToDelete) return;
                try {
                  await api.delete(`/tasks/${taskToDelete.id}/`);
                  setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
                  toast({ title: "Tâche supprimée", status: "info", duration: 2000, isClosable: true });
                } catch {
                  toast({ title: "Erreur lors de la suppression", status: "error", duration: 2000, isClosable: true });
                } finally {
                  setTaskToDelete(null);
                }
              }}
            >
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {editingTask && user && (
        <EditTaskModal
          task={editingTask}
          projectOwnerId={project.owner_id}
          currentUserId={user.id}
          allUsers={allUsers}
          onClose={() => setEditingTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={() => {}}
        />
      )}

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
    </Box>
  );
}
