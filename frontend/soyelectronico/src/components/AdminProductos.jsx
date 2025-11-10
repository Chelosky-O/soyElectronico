import { useEffect, useState } from "react";
import { API_PRODUCTOS, API_PEDIDOS } from "../services/api";

function AdminProductos({ auth }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagenUrl: "",
    categoria: "",
    detalles: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const cargarProductos = () => {
    setLoading(true);
    setError("");
    fetch(`${API_PRODUCTOS}/productos`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data) => setProductos(data))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la lista de productos");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const resetForm = () => {
    setForm({
      id: null,
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!form.nombre || !form.precio || !form.stock) {
      setError("Nombre, precio y stock son obligatorios");
      return;
    }

    const precioNum = parseFloat(form.precio);
    const stockNum = parseInt(form.stock, 10);

    if (Number.isNaN(precioNum) || precioNum <= 0) {
      setError("Precio inválido");
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError("Stock inválido");
      return;
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: precioNum,
      stock: stockNum,
      imagenUrl: form.imagenUrl,
      categoria: form.categoria,
      detalles: form.detalles,
    };

    try {
      const url = isEditing
        ? `${API_PRODUCTOS}/productos/${form.id}`
        : `${API_PRODUCTOS}/productos`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("No autorizado (se requiere admin)");
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al guardar el producto");
      }

      setMensaje(
        isEditing
          ? "Producto actualizado correctamente ✅"
          : "Producto creado correctamente ✅"
      );
      resetForm();
      cargarProductos();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar producto");
    }
  };

  const handleEditar = (p) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: String(p.precio),
      stock: String(p.stock),
      imagenUrl: p.imagenUrl || "",
      categoria: p.categoria || "",
      detalles: p.detalles || "",
    });
    setIsEditing(true);
    setMensaje("");
    setError("");
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    setMensaje("");
    setError("");

    try {
      const res = await fetch(`${API_PRODUCTOS}/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("No autorizado (se requiere admin)");
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al eliminar producto");
      }

      setMensaje("Producto eliminado ✅");
      cargarProductos();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al eliminar producto");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Administrar productos
        </h2>
        <p className="text-sm text-gray-500">
          Crea, edita y elimina productos del catálogo de SoyElectrónico.
        </p>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
          {mensaje}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
      >
        <div className="flex flex-col md:flex-row md:items-end md:gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL de imagen
            </label>
            <input
              name="imagenUrl"
              value={form.imagenUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://..."
            />
          </div>
            
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <input
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Arduino, Sensores, LEDs..."
            />
          </div>
        </div>
          
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Detalles (descripción larga)
          </label>
          <textarea
            name="detalles"
            value={form.detalles}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Describe el producto con más detalle..."
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Precio (CLP)
            </label>
            <input
              name="precio"
              value={form.precio}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              type="number"
              min="0"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex gap-2 mt-3 md:mt-0">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white"
            >
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Tabla de productos */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-4 text-gray-500 text-sm">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">
            No hay productos registrados.
          </p>
        ) : (
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">
                    ${Number(p.precio).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-2">{p.stock}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(p)}
                        className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-xs text-white font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id)}
                        className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-xs text-white font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminProductos;