import { useState } from "react";
import api from "../api/axiosInstance";
import type { Task, User, TaskPriority } from "../types";
import {
  Box,
  Button,
  VStack,
  Input,
  Textarea,
  Select,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import SelectReact from "react-select";

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

  const toast = useToast();

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
      toast({
        title: "Tâche créée",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch {
      setErrorMessage("Erreur lors de la création de la tâche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Créer une tâche</ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {errorMessage && <Text color="red.500">{errorMessage}</Text>}

            <Input
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
            />

            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isRequired
            />

            <Box>
              <Text mb={1}>Priorité :</Text>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </Select>
            </Box>

            <Box>
              <Text mb={1}>Assignés :</Text>
              <SelectReact
                options={allUsers.map((u) => ({ value: u.id, label: u.username }))}
                isMulti
                onChange={(selected) =>
                  setAssignees(selected.map((s) => s.value))
                }
                defaultValue={allUsers
                  .filter((u) => assignees.includes(u.id))
                  .map((u) => ({ value: u.id, label: u.username }))}
              />
              {assignees.includes(currentUserId) && (
                <Text fontSize="sm" color="gray.500">
                  Vous êtes assigné
                </Text>
              )}
            </Box>

            <Box>
              <Text mb={1}>Date limite :</Text>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose} isDisabled={loading}>
            Annuler
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Créer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
