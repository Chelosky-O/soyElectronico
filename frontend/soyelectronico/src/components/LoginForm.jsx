import { useEffect, useState } from "react";
import { API_USUARIOS } from "../services/api";

export default function LoginForm({ onLoginSuccess, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Si el modal se abre con otro modo, sincronizamos
  useEffect(() => {
    setMode(initialMode);
    setError("");
    setMensaje("");
  }, [initialMode]);

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await fetch(`${API_USUARIOS}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error al iniciar sesión");
        }

        const data = await res.json(); // { token }
        onLoginSuccess(data.token);
      } else {
        // REGISTRO
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
        setPassword("");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Encabezado con gradiente */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {isLogin ? "Bienvenido de vuelta" : "Nuevo en SoyElectrónico"}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isLogin
            ? "Accede al catálogo completo y revisa tus pedidos."
            : "Regístrate para empezar a comprar componentes electrónicos."}
        </p>
      </div>

      {/* Tabs login / registro */}
      <div className="flex mb-4 rounded-lg bg-slate-100 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 px-3 py-2 rounded-md transition ${
            isLogin
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 px-3 py-2 rounded-md transition ${
            !isLogin
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Registrarme
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700">
              Nombre completo
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Correo electrónico
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "Tu contraseña" : "Crea una contraseña segura"}
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
          className="mt-2 w-full px-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
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

      <p className="mt-4 text-[11px] text-slate-400 text-center">
        Tus datos se guardan de forma segura. Este proyecto es de práctica, no
        procesa pagos reales.
      </p>
    </div>
  );
}
