import { useEffect, useState } from "react";
import { getToken, saveToken, clearToken, decodeJwt } from "./auth";
import { API_USUARIOS, API_PRODUCTOS } from "./services/api";

import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import Catalogo from "./components/Catalogo";
import MisPedidos from "./components/MisPedidos";
import AdminProductos from "./components/AdminProductos";
import DetallesProducto from "./components/DetallesProducto";
import { useLocation, useNavigate } from "react-router-dom";

function App() {
  const [auth, setAuth] = useState(null); // { token, email, rol }
  const [view, setView] = useState("home"); // "home" | "catalogo" | "misPedidos" | "adminProductos"
  const [health, setHealth] = useState({ usuarios: "...", productos: "..." });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // búsqueda global del header (solo para página Productos)
  const [catalogSearchTerm, setCatalogSearchTerm] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("");

  // Modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("login"); // "login" | "register"

  const location = useLocation();
  const navigate = useNavigate();

  // Detectar si la URL es /productos/:id (para links compartidos)
  const match = location.pathname.match(/^\/productos\/(\d+)$/);
  const sharedProductId = match ? parseInt(match[1], 10) : null;
  const inSharedProductRoute = sharedProductId !== null;

  // Cargar token si existe
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

  // Health checks (debug)
  useEffect(() => {
    fetch(`${API_USUARIOS}/health`)
      .then((res) => res.text())
      .then((text) =>
        setHealth((prev) => ({ ...prev, usuarios: text }))
      )
      .catch((err) =>
        setHealth((prev) => ({
          ...prev,
          usuarios: "Error: " + err.message,
        }))
      );

    fetch(`${API_PRODUCTOS}/health`)
      .then((res) => res.text())
      .then((text) =>
        setHealth((prev) => ({ ...prev, productos: text }))
      )
      .catch((err) =>
        setHealth((prev) => ({
          ...prev,
          productos: "Error: " + err.message,
        }))
      );
  }, []);

  const openAuthModal = (mode = "login") => {
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    clearToken();
    setAuth(null);
    setView("home");
    navigate("/");
  };

  // Ahora, ver detalle → también cambia la URL
  const handleVerDetalle = (producto) => {
    setSelectedProduct(producto);
    // para que en el header quede marcado "Productos"
    setView("catalogo");
    navigate(`/productos/${producto.id}`);
  };

  const handleAdminModificarProduct = (producto) => {
    setSelectedProduct(producto);
    setView("adminProductos");
    // no cambiamos la URL aquí, admin sigue en la vista admin
  };

  const handleLoginSuccess = (token) => {
    saveToken(token);
    const payload = decodeJwt(token);
    setAuth({
      token,
      email: payload.email,
      rol: payload.rol,
    });
    setShowAuthModal(false);
  };

  // buscador del header
  const handleGlobalSearch = (term) => {
    const limpio = (term || "").trim();
    setCatalogCategory(""); // quitamos filtro de categoría
    setCatalogSearchTerm(limpio);
    setView("catalogo");
    navigate("/"); // seguimos usando "/" para home/catalogo
  };

  // desde el hero (kits / iluminación / conectividad)
  const handleCategoryClick = (categoria) => {
    setCatalogSearchTerm(""); // quitamos búsqueda por nombre
    setCatalogCategory(categoria); // ej: "kits", "iluminacion", "conectividad"
    setView("catalogo");
    navigate("/"); // el catálogo vive en "/"
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header estilo tienda */}
      <Header
        auth={auth}
        view={view}
        setView={(v) => {
          setView(v);
          // sincronizamos vistas principales con "/"
          if (v === "home" || v === "catalogo") navigate("/");
          if (v === "misPedidos") navigate("/"); // seguimos en "/" pero otra vista
          if (v === "adminProductos") navigate("/"); // idem
        }}
        onLogout={handleLogout}
        onLoginClick={() => openAuthModal("login")}
        onRegisterClick={() => openAuthModal("register")}
        onSearchSubmit={handleGlobalSearch}
      />

      {/* Contenido principal */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          {inSharedProductRoute ? (
            // ⚡ Modo "link compartido" → siempre mostramos DETALLE
            <DetallesProducto
              producto={selectedProduct}          // si venimos desde catálogo, ya está
              productoId={sharedProductId}        // si entramos directo, se usará esto para fetch
              auth={auth}
              onNeedLogin={() => openAuthModal("login")}
              onBack={() => {
                navigate("/");
                setView("catalogo");
              }}
              onAdminModificar={handleAdminModificarProduct}
            />
          ) : (
            <>
              {/* HOME: hero + solo algunos productos */}
              {view === "home" && (
                <HomePage
                  auth={auth}
                  onNeedLogin={() => openAuthModal("login")}
                  onRegisterClick={() => openAuthModal("register")}
                  goToCatalog={() => {
                    setCatalogCategory("");
                    setCatalogSearchTerm("");
                    setView("catalogo");
                    navigate("/");
                  }}
                  onVerDetalle={handleVerDetalle}
                  onCategoryClick={handleCategoryClick}
                />
              )}

              {/* PÁGINA PRODUCTOS: catálogo completo */}
              {view === "catalogo" && (
                <Catalogo
                  auth={auth}
                  onNeedLogin={() => openAuthModal("login")}
                  homeMode={false}
                  onVerDetalle={handleVerDetalle}
                  onAdminModificar={handleAdminModificarProduct}
                  searchTerm={catalogSearchTerm}
                  categoria={catalogCategory}
                />
              )}

              {/* MIS PEDIDOS */}
              {view === "misPedidos" && (
                auth ? (
                  auth.rol === "cliente" ? (
                    <MisPedidos auth={auth} />
                  ) : (
                    <MensajeCaja
                      titulo="Solo clientes"
                      texto="Solo los usuarios con rol cliente pueden ver esta sección."
                    />
                  )
                ) : (
                  <MensajeCaja
                    titulo="Inicia sesión"
                    texto="Tienes que iniciar sesión para ver tus pedidos."
                    accionTexto="Iniciar sesión"
                    onAccion={() => openAuthModal("login")}
                  />
                )
              )}

              {/* ADMIN PRODUCTOS */}
              {view === "adminProductos" && (
                auth ? (
                  auth.rol === "admin" ? (
                    <AdminProductos auth={auth} />
                  ) : (
                    <MensajeCaja
                      titulo="Acceso restringido"
                      texto="Esta sección es solo para administradores."
                    />
                  )
                ) : (
                  <MensajeCaja
                    titulo="Inicia sesión"
                    texto="Tienes que iniciar sesión como administrador para gestionar productos."
                    accionTexto="Iniciar sesión"
                    onAccion={() => openAuthModal("login")}
                  />
                )
              )}
            </>
          )}

          {/* Footer de estado de servicios */}
          <div className="mt-10 text-xs text-slate-400 flex flex-wrap gap-4 justify-center">
            <span>usuarios-service: {health.usuarios}</span>
            <span>productos-service: {health.productos}</span>
          </div>
        </div>
      </main>

      {/* Modal de Login / Registro */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>
            <LoginForm
              initialMode={authInitialMode}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Home: hero + 4 productos ---------- */
function HomePage({
  auth,
  onNeedLogin,
  onRegisterClick,
  goToCatalog,
  onVerDetalle,
  onCategoryClick,
}) {
  return (
    <section className="space-y-8">
      <HeroTienda
        auth={auth}
        onVerCatalogo={goToCatalog}
        onRegisterClick={onRegisterClick}
        onCategoryClick={onCategoryClick}
      />
      <Catalogo
        auth={auth}
        onNeedLogin={onNeedLogin}
        homeMode={true}
        onVerDetalle={onVerDetalle}
      />
    </section>
  );
}

/* Hero estilo ecommerce (claro) */
function HeroTienda({
  auth,
  onVerCatalogo,
  onRegisterClick,
  onCategoryClick,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10 md:py-10 shadow-sm">
      <div className="grid gap-8 md:grid-cols-[3fr,2fr] items-center">
        {/* Texto */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Todo para tus proyectos de electrónica
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
            Compra tus{" "}
            <span className="text-emerald-600">componentes electrónicos</span>{" "}
            en un solo lugar
          </h1>
          <p className="text-sm md:text-base text-slate-600 mb-5 max-w-xl">
            Arduinos, sensores, LEDs, cables, fuentes y más. Pensado para
            estudiantes, makers y profesionales que quieren armar cosas reales.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onVerCatalogo}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white shadow-md"
            >
              Ver todos los productos
            </button>

            {!auth && (
              <button
                onClick={onRegisterClick}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-sm font-semibold text-emerald-700 border border-emerald-100"
              >
                Crear cuenta gratis
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">●</span> Stock en tiempo real
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">●</span> Pedidos asociados a tu cuenta
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">●</span> Sistema con roles: admin / cliente
            </div>
          </div>
        </div>

        {/* Lado derecho tipo banner de productos */}
        <div className="grid gap-4">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg cursor-pointer hover:opacity-90"
            onClick={() => onCategoryClick && onCategoryClick("kits")}
          >
            <p className="text-xs uppercase tracking-wide mb-1">
              Para empezar
            </p>
            <h3 className="font-semibold text-sm mb-1">
              Kits Arduino & sensores básicos
            </h3>
            <p className="text-[11px] text-emerald-50">
              Ideal para aprender electrónica y programación sin complicarte.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="bg-slate-50 rounded-2xl p-3 border border-slate-200 cursor-pointer hover:bg-slate-100"
              onClick={() => onCategoryClick && onCategoryClick("iluminacion")}
            >
              <p className="text-[11px] text-slate-500 mb-1">Iluminación</p>
              <p className="text-xs font-semibold text-slate-900">
                Tiras LED RGB, matrices y módulos.
              </p>
            </div>
            <div
              className="bg-slate-50 rounded-2xl p-3 border border-slate-200 cursor-pointer hover:bg-slate-100"
              onClick={() =>
                onCategoryClick && onCategoryClick("conectividad")
              }
            >
              <p className="text-[11px] text-slate-500 mb-1">Conectividad</p>
              <p className="text-xs font-semibold text-slate-900">
                Jumpers, cables dupont y terminales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mensajes cuando faltan permisos / login */
function MensajeCaja({ titulo, texto, accionTexto, onAccion }) {
  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-slate-900">{titulo}</h2>
      <p className="text-sm text-slate-600 mb-4">{texto}</p>
      {onAccion && (
        <button
          onClick={onAccion}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white"
        >
          {accionTexto}
        </button>
      )}
    </div>
  );
}

export default App;
