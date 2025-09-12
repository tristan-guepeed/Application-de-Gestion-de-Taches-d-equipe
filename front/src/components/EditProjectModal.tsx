import { useState } from "react";
import api from "../api/axiosInstance";
import type { Project, User } from "../types";
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
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

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
  const toast = useToast();

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
        .filter((m) => m.role !== "owner")
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
      toast({
        title: "Projet mis à jour",
        description: "Les modifications ont été enregistrées.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  const editableMembers = members.filter((m) => m.role !== "owner");

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modifier le projet</ModalHeader>
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
                {editableMembers.map((m) => (
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
                            m.user_id!,
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
                        onClick={() => handleRemoveMember(m.user_id!)}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </HStack>
                ))}

                <HStack>
                  <Select id="add-user" placeholder="Choisir un utilisateur">
                    {allUsers
                      .filter((u) => !members.some((m) => m.user_id === u.id))
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

            <Box w="full">
              <Text fontWeight="bold" mb={2}>
                Transférer le propriétaire
              </Text>
              <Select
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(Number(e.target.value))}
              >
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user}
                  </option>
                ))}
              </Select>
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
            loadingText="Modification..."
          >
            Enregistrer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
