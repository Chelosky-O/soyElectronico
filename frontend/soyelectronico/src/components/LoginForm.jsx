import { useState } from "react";
import { API_USUARIOS } from "../services/api";

export default function LoginForm({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    try {
      if (mode === "login") {
        // 🔐 LOGIN
        const res = await fetch(`${API_USUARIOS}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error al iniciar sesión");
        }

        const data = await res.json(); // { token: "..." }
        onLoginSuccess(data.token);
      } else {
        // 🆕 REGISTRO
        const res = await fetch(`${API_USUARIOS}/usuarios/registro`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error al registrar usuario");
        }

        setMensaje("Cuenta creada correctamente 🎉 Ahora inicia sesión.");
        // Opcional: limpiar solo password
        setPassword("");
        // Opcional: volver automáticamente a modo login
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de servidor");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-1 text-center text-gray-800">
        {isLogin ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {isLogin
          ? "Ingresa con tu cuenta de SoyElectrónico"
          : "Regístrate para comprar en SoyElectrónico"}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading
            ? isLogin
              ? "Ingresando..."
              : "Creando cuenta..."
            : isLogin
            ? "Entrar"
            : "Registrarme"}
        </button>
      </form>

      <div className="mt-4 text-xs text-center text-gray-600">
        {isLogin ? (
          <>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setMensaje("");
              }}
              className="text-emerald-600 hover:underline"
            >
              Crear cuenta
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMensaje("");
              }}
              className="text-emerald-600 hover:underline"
            >
              Iniciar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
