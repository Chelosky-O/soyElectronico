import { useEffect, useState } from "react";
import { API_PRODUCTOS } from "../services/api";
import Toast from "./Toast";

export default function AdminProductos({ auth }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [toast, setToast] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null); // producto seleccionado para edición
  const [isCreating, setIsCreating] = useState(false); // modo creación

  const cargarProductos = async (term = "") => {
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      let url = `${API_PRODUCTOS}/productos`;
      const limpio = term.trim();
      if (limpio.length > 0) {
        url += `?q=${encodeURIComponent(limpio)}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Error al cargar productos");
      }

      const data = await res.json();
      setProductos(data);
      if (data.length > 0 && !selected) {
        setSelected(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    cargarProductos(searchTerm);
    setSearchTerm("");
  };

  const handleSelect = (producto) => {
    setSelected(producto);
    setIsCreating(false);
    setMensaje("");
    setError("");
  };

  const handleNewProduct = () => {
    setIsCreating(true);
    setSelected({
      nombre: "",
      descripcion: "",
      precio: 0,
      stock: 0,
      imagenUrl: "",
      categoria: "",
      detalles: "",
    });
    setMensaje("");
    setError("");
  };

  const handleChangeField = (field, value) => {
    setSelected((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!selected) return;

    setMensaje("");
    setError("");

    const payload = {
      nombre: selected.nombre,
      descripcion: selected.descripcion,
      precio: Number(selected.precio),
      stock: Number(selected.stock),
      imagenUrl: selected.imagenUrl,
      categoria: selected.categoria,
      detalles: selected.detalles,
    };

    try {
      const url = isCreating
        ? `${API_PRODUCTOS}/productos`
        : `${API_PRODUCTOS}/productos/${selected.id}`;
      const method = isCreating ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al guardar producto");
      }

      const productoGuardado = await res.json();

      if (isCreating) {
        // 🔹 Agregar nuevo producto a la lista
        setProductos((prev) => [...prev, productoGuardado]);
        setIsCreating(false);
      } else {
        // 🔹 Actualizar existente
        setProductos((prev) =>
          prev.map((p) => (p.id === productoGuardado.id ? productoGuardado : p))
        );
      }

      setSelected(productoGuardado);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setToast({
        message: isCreating
          ? "Producto creado correctamente ✅"
          : "Producto actualizado correctamente ✅",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setToast({
        message: err.message || "Error al guardar producto",
        type: "error",
      });
    }
  };

  if (loading) return <p className="text-slate-500">Cargando productos...</p>;
  if (error && !productos.length)
    return <p className="text-red-600 text-sm font-semibold">{error}</p>;

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Administración de productos
          </h2>
          <p className="text-xs text-slate-500">
            Busca, edita o crea nuevos productos.
          </p>
        </div>
        <button
          onClick={handleNewProduct}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white shadow"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Buscador de productos para admin */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex gap-2 items-center max-w-md"
      >
        <div className="flex items-center flex-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-500">
          <span className="mr-2">🔍</span>
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            className="bg-transparent outline-none flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white"
        >
          Buscar
        </button>
      </form>

      {mensaje && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
          {mensaje}
        </div>
      )}
      {error && productos.length > 0 && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
        {/* Lista de productos */}
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t border-slate-100 hover:bg-slate-50 ${
                    selected && selected.id === p.id && !isCreating
                      ? "bg-emerald-50"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2 text-xs text-slate-500">{p.id}</td>
                  <td className="px-4 py-2 text-sm text-slate-800">{p.nombre}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {p.categoria || "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    ${Number(p.precio).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">{p.stock}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleSelect(p)}
                      className="text-[11px] px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-3 text-xs text-slate-500 text-center"
                  >
                    No hay productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario de edición / creación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {selected ? (
            <form className="space-y-3" onSubmit={handleGuardar}>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                {isCreating
                  ? "Nuevo producto"
                  : `Editar producto #${selected.id}`}
              </h3>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={selected.nombre || ""}
                  onChange={(e) => handleChangeField("nombre", e.target.value)}
                  required
                />
              </div>

              {/* Imagen URL */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">
                  URL de imagen
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://..."
                  value={selected.imagenUrl || ""}
                  onChange={(e) => handleChangeField("imagenUrl", e.target.value)}
                />
                {selected.imagenUrl && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={selected.imagenUrl}
                        alt={selected.nombre}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">
                  Categoría
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="ej: kits, iluminacion, conectividad"
                  value={selected.categoria || ""}
                  onChange={(e) => handleChangeField("categoria", e.target.value)}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">
                  Descripción corta
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={2}
                  value={selected.descripcion || ""}
                  onChange={(e) =>
                    handleChangeField("descripcion", e.target.value)
                  }
                />
              </div>

              {/* Detalles */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">
                  Detalles (ficha larga)
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                  placeholder="Más información técnica, usos, especificaciones..."
                  value={selected.detalles || ""}
                  onChange={(e) => handleChangeField("detalles", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={selected.precio}
                    onChange={(e) => handleChangeField("precio", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={selected.stock}
                    onChange={(e) => handleChangeField("stock", e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white"
              >
                {isCreating ? "Crear producto" : "Guardar cambios"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500">
              Elige un producto de la lista o crea uno nuevo.
            </p>
          )}
        </div>
      </div>

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
