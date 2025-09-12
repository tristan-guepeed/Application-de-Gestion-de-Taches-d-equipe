import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuthContext } from "../context/auth";
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

export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo("Connexion en cours, veuillez patienter...");

    try {
      await login(username, password);
      setInfo("Connexion réussie ! Redirection...");
      toast({
        title: "Bienvenue !",
        description: "Vous êtes connecté avec succès",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setTimeout(() => {
        navigate("/projects");
      }, 1000);
    } catch (err) {
      const error = err as import("axios").AxiosError<{ detail: string }>;
      if (error.response) {
        const message = error.response.data.detail;
        if (message === "No active account found with the given credentials") {
          setError("Identifiants invalides");
        } else {
          setError(message);
        }
      } else {
        setError("Erreur réseau");
      }
      setInfo(null);
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
          Connexion
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
            {info && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                {info}
              </Alert>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Connexion en cours..."
            >
              Se connecter
            </Button>
          </VStack>
        </form>

        <Text mt={4} textAlign="center">
          Pas encore de compte ?{" "}
          <Link as={RouterLink} to="/register" color="brand.500" fontWeight="bold">
            S'inscrire
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
