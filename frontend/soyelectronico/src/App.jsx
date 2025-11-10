import { useEffect, useState } from "react";
import { getToken, saveToken, clearToken, decodeJwt } from "./auth";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import Catalogo from "./components/Catalogo";
import MisPedidos from "./components/MisPedidos";
import AdminProductos from "./components/AdminProductos";
import { API_USUARIOS, API_PRODUCTOS } from "./services/api";

export default function App() {
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState("home");
  const [health, setHealth] = useState({ usuarios: "...", productos: "..." });

  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setAuth({ token, email: payload.email, rol: payload.rol });
      } else clearToken();
    }
  }, []);

  useEffect(() => {
    fetch(`${API_USUARIOS}/health`)
      .then((r) => r.text())
      .then((t) => setHealth((p) => ({ ...p, usuarios: t })));
    fetch(`${API_PRODUCTOS}/health`)
      .then((r) => r.text())
      .then((t) => setHealth((p) => ({ ...p, productos: t })));
  }, []);

  const handleLogout = () => {
    clearToken();
    setAuth(null);
    setView("login");
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
        <LoginForm
          onLoginSuccess={(token) => {
            saveToken(token);
            const payload = decodeJwt(token);
            setAuth({ token, email: payload.email, rol: payload.rol });
            setView("home");
          }}
        />
        <div className="mt-8 text-xs text-gray-500">
          <div>usuarios-service: {health.usuarios}</div>
          <div>productos-service: {health.productos}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header auth={auth} view={view} setView={setView} onLogout={handleLogout} />
      <main className="flex-1 p-6">
        {view === "home" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido, {auth.rol === "admin" ? "administrador" : "cliente"} 👋
            </h1>
            <p className="text-gray-600">
              Desde aquí podrás navegar por el catálogo, hacer compras y, si eres administrador, gestionar los productos.
            </p>
          </div>
        )}
        {view === "catalogo" && <Catalogo auth={auth} />}
        {view === "misPedidos" && auth.rol === "cliente" && <MisPedidos auth={auth} />}
        {view === "adminProductos" && auth.rol === "admin" && <AdminProductos auth={auth} />}
      </main>
    </div>
  );
}
