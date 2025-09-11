import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/auth";

export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null); // nouveau

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo("Connexion en cours, veuillez patienter..."); // message

    try {
      await login(username, password);
      setInfo("Connexion réussie ! Redirection vers le dashboard...");
      // redirection après un petit délai pour montrer le message
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
      setInfo(null); // enlever le message en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        {info && <div style={{ color: "green", marginBottom: 10 }}>{info}</div>}
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>

      <div style={{ marginTop: 15 }}>
        <span>Pas encore de compte ? </span>
        <Link to="/register" style={{ color: "blue", textDecoration: "underline" }}>
          S'inscrire
        </Link>
      </div>
    </div>
  );
}
