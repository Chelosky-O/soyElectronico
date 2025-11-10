import { useEffect, useState } from "react";
import { API_PRODUCTOS, API_PEDIDOS } from "../services/api";

function Catalogo({ auth }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_PRODUCTOS}/productos`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar productos");
        }
        return res.json();
      })
      .then((data) => {
        setProductos(data);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el catálogo");
      })
      .finally(() => setLoading(false));
  }, []);

  const comprar = async (productoId) => {
    if (auth.rol !== "cliente") {
      setMensaje("Solo los clientes pueden comprar");
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

      const pedido = await res.json();
      console.log("Pedido creado:", pedido);
      setMensaje("Compra realizada correctamente ✅");
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al comprar");
    }
  };

  if (loading) {
    return <p className="text-gray-500">Cargando catálogo...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Catálogo de productos
        </h2>
        <span className="text-xs text-gray-500">
          {productos.length} productos
        </span>
      </div>

      {mensaje && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
          {mensaje}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {productos.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
      <div>
        <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
          <img
            src={p.imagenUrl || "/placeholder.png"}
            alt={p.nombre}
            className="object-cover w-full h-full"
          />
        </div>
        <h3 className="font-semibold text-sm mb-0.5 text-gray-900 line-clamp-1">
          {p.nombre}
        </h3>
        {p.categoria && (
          <p className="text-xs text-gray-500 mb-1">{p.categoria}</p>
        )}
        {p.descripcion && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {p.descripcion}
          </p>
        )}
        <p className="text-emerald-600 font-bold text-base mb-2">
          ${Number(p.precio).toLocaleString("es-CL")}
        </p>
      </div>

            {auth.rol === "cliente" && (
              <button
                onClick={() => comprar(p.id)}
                disabled={p.stock <= 0}
                className="mt-auto w-full px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {p.stock > 0 ? "Comprar" : "Sin stock"}
              </button>
            )}

            {auth.rol === "admin" && (
              <p className="mt-4 text-xs text-gray-500">
                (Vista de catálogo; la gestión completa está en Admin
                productos)
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;