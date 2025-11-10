export default function Header({ auth, view, setView, onLogout }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <img
          src="/icono-chip.png"
          alt="Icono SoyElectrónico"
          className="w-7 h-7 object-contain"
        />
        <span className="text-xl font-bold text-emerald-600">
          SoyElectrónico
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {auth.rol === "admin" ? "Admin" : "Cliente"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {[
          { name: "Inicio", key: "home" },
          { name: "Catálogo", key: "catalogo" },
          ...(auth.rol === "cliente"
            ? [{ name: "Mis pedidos", key: "misPedidos" }]
            : []),
          ...(auth.rol === "admin"
            ? [{ name: "Admin productos", key: "adminProductos" }]
            : []),
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setView(btn.key)}
            className={`text-xs px-2 py-1 rounded ${
              view === btn.key
                ? "bg-gray-200 text-gray-900"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {btn.name}
          </button>
        ))}

        <span className="text-gray-600">{auth.email}</span>
        <button
          onClick={onLogout}
          className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-xs font-semibold text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}