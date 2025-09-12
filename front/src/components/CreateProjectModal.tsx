import { useState } from "react";
import api from "../api/axiosInstance";
import type { User, Project } from "../types";
import type { AxiosError } from "axios";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Box,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";

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
  currentUserId: number;
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
  const toast = useToast();

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
      toast({
        title: "Projet créé",
        description: "Votre projet a été ajouté avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Créer un projet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} as="form" onSubmit={handleSubmit}>
            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {errorMessage}
              </Alert>
            )}

            <FormControl>
              <FormLabel>Nom du projet</FormLabel>
              <Input
                placeholder="Nom du projet"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <Box w="full">
              <Text fontWeight="bold" mb={2}>
                Membres
              </Text>
              <VStack spacing={2} align="stretch">
                {members.map((m) => (
                  <HStack
                    key={m.user_id}
                    p={2}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <Text>{m.user}</Text>
                    <HStack>
                      <Select
                        size="sm"
                        value={m.role}
                        onChange={(e) =>
                          handleRoleChange(
                            m.user_id,
                            e.target.value as ProjectMember["role"]
                          )
                        }
                      >
                        <option value="manager">Manager</option>
                        <option value="member">Membre</option>
                      </Select>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveMember(m.user_id)}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </HStack>
                ))}

                <HStack>
                  <Select id="add-user" placeholder="Choisir un utilisateur">
                    {allUsers
                      .filter(
                        (u) =>
                          u.id !== currentUserId &&
                          !members.some((m) => m.user_id === u.id)
                      )
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                  </Select>
                  <Select id="add-role" defaultValue="member">
                    <option value="member">Membre</option>
                    <option value="manager">Manager</option>
                  </Select>
                  <Button
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
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Création..."
          >
            Créer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
