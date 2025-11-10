import { useState } from "react";
import { API_USUARIOS } from "../services/api";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_USUARIOS}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onLoginSuccess(data.token);
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas o error de servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-1 text-center text-gray-800">
        Iniciar sesión
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Ingresa con tu cuenta de SoyElectrónico
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
