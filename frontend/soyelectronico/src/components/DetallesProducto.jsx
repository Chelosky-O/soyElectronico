import { useEffect, useState } from "react";
import { API_PEDIDOS, API_PRODUCTOS } from "../services/api";

export default function DetallesProducto({
  producto,
  productoId,
  auth,
  onNeedLogin,
  onBack,
  onAdminModificar,
}) {
  const [mensaje, setMensaje] = useState("");
  const [productoLocal, setProductoLocal] = useState(producto || null);
  const [loading, setLoading] = useState(!producto && !!productoId);
  const [error, setError] = useState("");

  const isAdmin = auth?.rol === "admin";
  const isCliente = auth?.rol === "cliente";

  // Cargar producto si venimos de un link directo (/productos/:id)
  useEffect(() => {
    if (producto) {
      setProductoLocal(producto);
      setLoading(false);
      setError("");
      return;
    }

    if (!producto && productoId) {
      setLoading(true);
      setError("");

      fetch(`${API_PRODUCTOS}/productos/${productoId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Producto no encontrado");
          return res.json();
        })
        .then((data) => {
          setProductoLocal(data);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "Error al cargar producto");
        })
        .finally(() => setLoading(false));
    }
  }, [producto, productoId]);

  const comprar = async () => {
    if (!productoLocal) return;

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
      const res = await fetch(`${API_PEDIDOS}/comprar/${productoLocal.id}`, {
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

      // Actualizar stock local
      setProductoLocal((prev) =>
        prev
          ? {
              ...prev,
              stock: Math.max(0, (prev.stock ?? 0) - cantidad),
            }
          : prev
      );

      setMensaje("Compra realizada correctamente ✅");
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "Error al comprar");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Cargando producto...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white"
          >
            Volver
          </button>
        )}
      </div>
    );
  }

  if (!productoLocal) return null;

  return (
    <section className="space-y-4">
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs text-slate-600 hover:text-slate-900 mb-2"
        >
          ← Volver a productos
        </button>
      )}

      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[1.4fr,2fr] items-start">
          {/* Imagen */}
          <div className="flex flex-col gap-3">
            <div className="w-full h-64 md:h-80 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
              <img
                src={productoLocal.imagenUrl || "/placeholder.png"}
                alt={productoLocal.nombre}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              ID producto: {productoLocal.id}
            </p>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {productoLocal.nombre}
              </h1>
              {productoLocal.categoria && (
                <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">
                  {productoLocal.categoria}
                </p>
              )}
            </div>

            {productoLocal.detalles && (
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {productoLocal.detalles}
              </p>
            )}

            {!productoLocal.detalles && productoLocal.descripcion && (
              <p className="text-sm text-slate-700">
                {productoLocal.descripcion}
              </p>
            )}

            <div className="mt-2 flex items-baseline gap-3">
              <p className="text-2xl font-bold text-emerald-600">
                ${Number(productoLocal.precio).toLocaleString("es-CL")}
              </p>
              <p className="text-xs text-slate-500">
                Stock:{" "}
                <span
                  className={
                    productoLocal.stock > 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }
                >
                  {productoLocal.stock > 0
                    ? productoLocal.stock
                    : "Sin stock"}
                </span>
              </p>
            </div>

            {mensaje && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
                {mensaje}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-3">
              {isAdmin ? (
                <button
                  onClick={() =>
                    onAdminModificar && onAdminModificar(productoLocal)
                  }
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white"
                >
                  Modificar producto
                </button>
              ) : (
                <button
                  onClick={comprar}
                  disabled={productoLocal.stock <= 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {productoLocal.stock > 0 ? "Comprar ahora" : "Sin stock"}
                </button>
              )}

              {onBack && (
                <button
                  onClick={onBack}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 border border-slate-200"
                >
                  Volver al catálogo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
