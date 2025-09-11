import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/users/register/", { username, password });
      setSuccess("Compte créé avec succès ! Redirection vers la connexion...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const error = err as import("axios").AxiosError<{ detail: string }>;
      if (error.response) {
        const message = error.response.data.detail;
        setError(message);
      } else {
        setError("Erreur réseau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Créer un compte</h1>
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
        {success && <div style={{ color: "green", marginBottom: 10 }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Création en cours..." : "S'inscrire"}
        </button>
      </form>

      <div style={{ marginTop: 15 }}>
        <span>Déjà un compte ? </span>
        <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
          Se connecter
        </Link>
      </div>
    </div>
  );
}
