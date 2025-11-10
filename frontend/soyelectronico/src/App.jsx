import { useEffect, useState } from "react";
import { getToken, saveToken, clearToken, decodeJwt } from "./auth";

// URL base de tus servicios (puedes ajustarlas a mano)
const API_USUARIOS = "http://localhost:8081/api";
const API_PRODUCTOS = "http://localhost:8082/api";

function App() {
  const [auth, setAuth] = useState(null); // { token, email, rol }
  const [view, setView] = useState("home"); // "home" | "login" | "catalogo"
  const [health, setHealth] = useState({ usuarios: "...", productos: "..." });

  // Al cargar, revisar si ya hay token guardado
  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setAuth({
          token,
          email: payload.email,
          rol: payload.rol,
        });
      } else {
        clearToken();
      }
    }
  }, []);

  // Health checks
  useEffect(() => {
    fetch(`${API_USUARIOS}/health`)
      .then((res) => res.text())
      .then((text) =>
        setHealth((prev) => ({ ...prev, usuarios: text }))
      )
      .catch((err) =>
        setHealth((prev) => ({ ...prev, usuarios: "Error: " + err.message }))
      );

    fetch(`${API_PRODUCTOS}/health`)
      .then((res) => res.text())
      .then((text) =>
        setHealth((prev) => ({ ...prev, productos: text }))
      )
      .catch((err) =>
        setHealth((prev) => ({ ...prev, productos: "Error: " + err.message }))
      );
  }, []);

  const handleLogout = () => {
    clearToken();
    setAuth(null);
    setView("login");
  };

  // Si no hay auth, vista de login
  if (!auth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <LoginForm
          onLoginSuccess={(token) => {
            saveToken(token);
            const payload = decodeJwt(token);
            setAuth({
              token,
              email: payload.email,
              rol: payload.rol,
            });
            setView("home");
          }}
        />

        <div className="mt-8 text-xs text-slate-400">
          <div>usuarios-service: {health.usuarios}</div>
          <div>productos-service: {health.productos}</div>
        </div>
      </div>
    );
  }

  // Si hay auth, app principal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra superior */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-400">
            SoyElectrónico
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {auth.rol === "admin" ? "Admin" : "Cliente"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-300">{auth.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-xs font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal (placeholder por ahora) */}
      <main className="flex-1 p-6">
        {view === "home" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">
              Bienvenido, {auth.rol === "admin" ? "administrador" : "cliente"} 👋
            </h1>
            <p className="text-slate-300">
              Aquí después mostraremos el catálogo, compras y panel admin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8081/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al iniciar sesión");
      }

      const data = await res.json(); // { token: "..." }
      onLoginSuccess(data.token);
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas o error de servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h1 className="text-2xl font-bold mb-1 text-center">Iniciar sesión</h1>
      <p className="text-sm text-slate-400 mb-6 text-center">
        Ingresa con tu cuenta de SoyElectrónico
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}



