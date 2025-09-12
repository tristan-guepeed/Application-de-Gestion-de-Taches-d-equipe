import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axiosInstance";
import type { Task, User, TaskPriority } from "../types";
import type { AxiosError } from "axios";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Select as ChakraSelect,
  Textarea,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";
import Select from "react-select";

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
}: EditTaskModalProps) {
  const canEdit = currentUserId === projectOwnerId || currentUserId === task.created_by;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignees, setAssignees] = useState<number[]>(task.assignees_info.map(a => a.id));
  const [dueDate, setDueDate] = useState(task.due_date);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toast = useToast();

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
      toast({
        title: "Tâche modifiée",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      setErrorMessage(error.response?.data.detail || "Erreur lors de la modification de la tâche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <VStack spacing={4} align="stretch">
        <Heading size="md">Modifier la tâche</Heading>

        {errorMessage && (
          <Box color="red.500">{errorMessage}</Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <Box>
              <FormLabel>Titre</FormLabel>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titre"
                isDisabled={!canEdit}
                required
              />
            </Box>

            <Box>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description"
                isDisabled={!canEdit}
                required
              />
            </Box>

            <Box>
              <FormLabel>Priorité</FormLabel>
              <ChakraSelect
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                isDisabled={!canEdit}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </ChakraSelect>
            </Box>

            <Box>
              <FormLabel>Assignés</FormLabel>
              <Select
                isMulti
                options={allUsers.map(u => ({ value: u.id, label: u.username }))}
                value={allUsers
                  .filter(u => assignees.includes(u.id))
                  .map(u => ({ value: u.id, label: u.username }))}
                onChange={selected => setAssignees(selected.map(s => s.value))}
                isDisabled={!canEdit}
                placeholder="Choisir les assignés..."
              />
            </Box>

            <Box>
              <FormLabel>Date limite</FormLabel>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                isDisabled={!canEdit}
              />
            </Box>

            <Flex justify="flex-end" gap={2}>
              <Button onClick={onClose} isDisabled={loading}>
                Annuler
              </Button>
              {canEdit && (
                <Button type="submit" colorScheme="blue" isLoading={loading}>
                  Enregistrer
                </Button>
              )}
            </Flex>
          </VStack>
        </form>
      </VStack>
    </Modal>
  );
}
