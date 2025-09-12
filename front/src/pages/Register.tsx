import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api/axiosInstance";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Link,
  Alert,
  AlertIcon,
  VStack,
  useToast,
} from "@chakra-ui/react";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/users/register/", { username, password });
      setSuccess("Compte créé avec succès ! Redirection...");
      toast({
        title: "Succès",
        description: "Compte créé avec succès, redirection en cours...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const error = err as import("axios").AxiosError<{ detail: string }>;
      if (error.response) {
        setError(error.response.data.detail);
      } else {
        setError("Erreur réseau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg="gray.50"
      px={4}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        maxW="md"
        w="full"
      >
        <Heading textAlign="center" mb={6} color="brand.500">
          Créer un compte
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Nom d'utilisateur</FormLabel>
              <Input
                type="text"
                placeholder="Entrez votre pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="filled"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Mot de passe</FormLabel>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="filled"
              />
            </FormControl>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {success && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Création en cours..."
            >
              S'inscrire
            </Button>
          </VStack>
        </form>

        <Text mt={4} textAlign="center">
          Déjà un compte ?{" "}
          <Link as={RouterLink} to="/login" color="brand.500" fontWeight="bold">
            Se connecter
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
