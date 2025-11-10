import { useEffect, useState } from "react";
import { API_PRODUCTOS, API_PEDIDOS } from "../services/api";

function MisPedidos({ auth }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_PEDIDOS}/pedidos/mios`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("No autorizado");
        if (!res.ok) throw new Error("Error al obtener pedidos");
        return res.json();
      })
      .then((data) => setPedidos(data))
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar pedidos");
      })
      .finally(() => setLoading(false));
  }, [auth.token]);

  if (loading) return <p className="text-gray-500">Cargando pedidos...</p>;
  if (error)
    return <p className="text-red-600 text-sm font-semibold">{error}</p>;

  if (pedidos.length === 0)
    return (
      <p className="text-gray-500 text-sm">
        No tienes pedidos realizados aún.
      </p>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Mis pedidos</h2>
      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Producto ID</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Fecha pedido</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.productoId}</td>
                <td className="px-4 py-2">{p.cantidad}</td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(p.fechaPedido).toLocaleString("es-CL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MisPedidos;