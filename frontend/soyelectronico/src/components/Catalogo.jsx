// src/components/Catalogo.jsx
import { useEffect, useState } from "react";
import { API_PRODUCTOS, API_PEDIDOS } from "../services/api";
import Toast from "./Toast";

export default function Catalogo({
  auth,
  onNeedLogin,
  homeMode = false,
  onVerDetalle,
  onAdminModificar,
  searchTerm = "",
  categoria = "",
}) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [toast, setToast] = useState(null);

  // categorías disponibles y categoría seleccionada
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    (categoria || "").trim()
  );

  const isAdmin = auth?.rol === "admin";
  const isCliente = auth?.rol === "cliente";

  // Sincronizar categoría inicial que viene desde App/Hero
  useEffect(() => {
    setSelectedCategory((categoria || "").trim());
  }, [categoria]);

  // 1) Cargar TODAS las categorías desde todos los productos (sin filtros)
  useEffect(() => {
    if (homeMode) return; // en home no necesitamos selector de categoría

    fetch(`${API_PRODUCTOS}/productos`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data) => {
        const cats = new Set();
        data.forEach((p) => {
          if (p.categoria && typeof p.categoria === "string") {
            cats.add(p.categoria);
          }
        });
        setAvailableCategories(Array.from(cats).sort());
      })
      .catch((err) => {
        console.error(err);
        // no rompemos la vista si falla, solo dejamos sin categorías
      });
  }, [homeMode]);

  // 2) Cargar productos (con filtro por categoría / búsqueda)
  useEffect(() => {
    setLoading(true);
    setError("");

    let url = `${API_PRODUCTOS}/productos`;

    if (!homeMode) {
      const cat = (selectedCategory || "").trim();
      const term = (searchTerm || "").trim();

      if (cat.length > 0) {
        // filtro por categoría
        url += `?categoria=${encodeURIComponent(cat)}`;
      } else if (term.length > 0) {
        // filtro por nombre
        url += `?q=${encodeURIComponent(term)}`;
      }
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data) => {
        const lista = homeMode ? data.slice(0, 4) : data; // en home solo 4
        setProductos(lista);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el catálogo");
      })
      .finally(() => setLoading(false));
  }, [homeMode, searchTerm, selectedCategory]);

  const comprar = async (productoId) => {
    if (!isCliente) {
      setMensaje("Debes iniciar sesión como cliente para comprar.");
      if (onNeedLogin) onNeedLogin();
      return;
    }

    const cantidadStr = prompt("¿Cuántas unidades quieres comprar?");
    if (!cantidadStr) return;

    const cantidad = parseInt(cantidadStr, 10);
    if (Number.isNaN(cantidad) || cantidad <= 0) {
      setMensaje("Cantidad inválida");
      return;
    }

    setMensaje("");

    try {
      const res = await fetch(`${API_PEDIDOS}/comprar/${productoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ cantidad }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("No autorizado para comprar");
      }

      if (res.status === 409) {
        const text = await res.text();
        throw new Error(text || "Stock insuficiente");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al procesar la compra");
      }

      await res.json().catch(() => {});

      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoId
            ? {
                ...p,
                stock: Math.max(0, (p.stock ?? 0) - cantidad),
              }
            : p
        )
      );

      setMensaje("Compra realizada correctamente ✅");
      setToast({
        message: "Compra realizada correctamente ✅",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const msg = err.message || "Error al comprar";
      setMensaje(msg);
      setToast({
        message: msg,
        type: "error",
      });
    }
  };

  if (loading) return <p className="text-slate-500">Cargando catálogo...</p>;
  if (error)
    return <p className="text-red-600 text-sm font-semibold">{error}</p>;

  const titulo = homeMode ? "Productos destacados" : "Todos los productos";
  const subtitulo = homeMode
    ? "Algunos de los componentes que puedes encontrar en la tienda."
    : selectedCategory && selectedCategory.length > 0
    ? `Explorando categoría "${selectedCategory}".`
    : searchTerm && searchTerm.trim().length > 0
    ? `Mostrando resultados para "${searchTerm.trim()}".`
    : "Explora el catálogo completo.";

  return (
    <section className="space-y-4" id={homeMode ? undefined : "catalogo"}>
      {/* Encabezado */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{titulo}</h2>
          <p className="text-xs text-slate-500">{subtitulo}</p>
        </div>
        <span className="text-xs text-slate-500 self-start sm:self-auto">
          {productos.length} {homeMode ? "mostrados" : "encontrados"}
        </span>
      </div>

      {/* Filtro por categoría (solo en vista catálogo) */}
      {!homeMode && availableCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Filtrar por categoría
          </label>
          <select
            className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {mensaje && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
          {mensaje}
        </div>
      )}

      {/* Grilla de productos */}
      {productos.length === 0 ? (
        <p className="text-sm text-slate-500">
          No se encontraron productos para esta búsqueda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col shadow-sm hover:shadow-md hover:border-emerald-200 transition"
            >
              {/* Imagen */}
              <div className="w-full aspect-square mb-2 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                <img
                  src={p.imagenUrl || "/placeholder.png"}
                  alt={p.nombre}
                  className="object-contain w-full h-full"
                />
              </div>

              {/* Info */}
              <h3 className="font-semibold text-sm mb-0.5 text-slate-900 line-clamp-1">
                {p.nombre}
              </h3>
              {p.categoria && (
                <p className="text-[11px] text-emerald-600 mb-1 uppercase tracking-wide">
                  {p.categoria}
                </p>
              )}
              {p.descripcion && (
                <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
                  {p.descripcion}
                </p>
              )}

              <p className="text-emerald-600 font-bold text-base mb-1">
                ${Number(p.precio).toLocaleString("es-CL")}
              </p>

              <p className="text-[11px] text-slate-500 mb-2">
                Stock:{" "}
                <span
                  className={
                    p.stock > 0 ? "text-emerald-600" : "text-red-500"
                  }
                >
                  {p.stock > 0 ? p.stock : "Sin stock"}
                </span>
              </p>

              {/* Acciones */}
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={() => onVerDetalle && onVerDetalle(p)}
                  className="w-full px-2 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-800 border border-slate-200"
                >
                  Ver detalle
                </button>

                {isAdmin ? (
                  <button
                    onClick={() => onAdminModificar && onAdminModificar(p)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-white"
                  >
                    Modificar
                  </button>
                ) : (
                  <button
                    onClick={() => comprar(p.id)}
                    disabled={p.stock <= 0}
                    className="w-full px-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {p.stock > 0 ? "Comprar" : "Sin stock"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
