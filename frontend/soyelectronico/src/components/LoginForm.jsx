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

  // Para mostrar la checklist visual
  const [passwordChecks, setPasswordChecks] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
  });

  const getPasswordChecks = (value) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);

    return { hasMinLength, hasUppercase, hasLowercase };
  };

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

    // Validaciones SOLO en registro
    if (!isLogin) {
      const checks = getPasswordChecks(password);
      const isValid =
        checks.hasMinLength && checks.hasUppercase && checks.hasLowercase;

      if (!isValid) {
        setError(
          "La contraseña debe tener mínimo 8 caracteres, una mayúscula y una minúscula."
        );
        return;
      }
    }

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
        setPasswordChecks({
          hasMinLength: false,
          hasUppercase: false,
          hasLowercase: false,
        });
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de servidor");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordChecks(getPasswordChecks(value));
  };

  return (
    <div className="w-full">
      {/* Encabezado */}
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

      {/* Tabs */}
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
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
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
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
            value={password}
            onChange={handlePasswordChange}
            placeholder={isLogin ? "Tu contraseña" : "Crea una contraseña segura"}
            required
          />

          {/* Checklist visual */}
          {!isLogin && (
            <div className="mt-2 text-xs space-y-1">
              <p
                className={`${
                  passwordChecks.hasMinLength ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {passwordChecks.hasMinLength ? "✔" : "✖"} Mínimo 8 caracteres
              </p>
              <p
                className={`${
                  passwordChecks.hasUppercase ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {passwordChecks.hasUppercase ? "✔" : "✖"} Al menos 1 mayúscula
              </p>
              <p
                className={`${
                  passwordChecks.hasLowercase ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {passwordChecks.hasLowercase ? "✔" : "✖"} Al menos 1 minúscula
              </p>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {mensaje && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            {mensaje}
          </div>
        )}

        {/* Botón sin bloqueo */}
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
    </div>
  );
}
