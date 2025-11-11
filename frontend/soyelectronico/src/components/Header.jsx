// src/components/Header.jsx
import { useState } from "react";

export default function Header({
  auth,
  view,
  setView,
  onLogout,
  onLoginClick,
  onRegisterClick,
  onSearchSubmit,
}) {
  const isLogged = !!auth;
  const rol = auth?.rol || null;
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const termino = search.trim();
    if (!termino) return;
    if (onSearchSubmit) {
      onSearchSubmit(termino);
    }
    setSearch("");
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + nombre */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView("home")}
        >
          <img
            src="/icono-chip.png"
            alt="Icono SoyElectrónico"
            className="w-8 h-8 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-emerald-600">
              SoyElectrónico
            </span>
            <span className="text-[11px] text-slate-400">
              Componentes para tus proyectos
            </span>
          </div>
        </div>

        {/* Búsqueda */}
        <form
          onSubmit={handleSubmit}
          className="hidden md:flex flex-1 max-w-md"
        >
          <div className="flex items-center w-full px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <span className="mr-2">🔍</span>
            <input
              type="text"
              placeholder="Buscar Arduino, sensores, LEDs..."
              className="bg-transparent outline-none flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 text-[11px] px-2 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Navegación + acciones */}
        <div className="flex items-center gap-4 text-sm">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setView("home")}
              className={`text-xs px-2 py-1 rounded ${
                view === "home"
                  ? "bg-slate-100 text-slate-900"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => setView("catalogo")}
              className={`text-xs px-2 py-1 rounded ${
                view === "catalogo"
                  ? "bg-slate-100 text-slate-900"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Productos
            </button>

            {isLogged && rol === "cliente" && (
              <button
                onClick={() => setView("misPedidos")}
                className={`text-xs px-2 py-1 rounded ${
                  view === "misPedidos"
                    ? "bg-slate-100 text-slate-900"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Mis pedidos
              </button>
            )}

            {isLogged && rol === "admin" && (
              <button
                onClick={() => setView("adminProductos")}
                className={`text-xs px-2 py-1 rounded ${
                  view === "adminProductos"
                    ? "bg-slate-100 text-slate-900"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Zona derecha: login / usuario */}
          {!isLogged ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="text-xs px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Iniciar sesión
              </button>
              <button
                onClick={onRegisterClick}
                className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-100 font-semibold"
              >
                Crear cuenta
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs text-slate-700 max-w-[140px] truncate">
                  {auth.email}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {rol === "admin" ? "Administrador" : "Cliente"}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-[11px] font-semibold text-white"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
