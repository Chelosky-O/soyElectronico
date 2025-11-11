import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors =
    type === "error"
      ? "bg-red-500 text-white border-red-600"
      : "bg-emerald-500 text-white border-emerald-600";

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded-xl border shadow-lg z-50 transition-all ${colors}`}
    >
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
