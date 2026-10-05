"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DispositivosPage() {
const router = useRouter();
  const [form, setForm] = useState({
  imei: "",
  marca: "",
  modelo: "",
  almacenamiento: "",
  color: "",
  estado: "DISPONIBLE",
  precio_compra: "",
  precio_venta: "",
  condicion: "NUEVO",
});
  const [mensaje, setMensaje] = useState("");

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    const { data: sessionData } = await supabase.auth.getSession();
const token = sessionData.session?.access_token;

if (!token) {
  setMensaje("Sesión no válida. Inicia sesión nuevamente.");
  router.push("/login");
  return;
}
    const respuesta = await fetch("/api/dispositivos", {
      method: "POST",
      headers: {
      Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const resultado = await respuesta.json();
    if (respuesta.ok) {
      setMensaje("Dispositivo registrado correctamente");
     setForm({
  imei: "",
  marca: "",
  modelo: "",
  almacenamiento: "",
  color: "",
  estado: "DISPONIBLE",
  precio_compra: "",
  precio_venta: "",
  condicion: "NUEVO",
});
    } else {
      setMensaje(resultado.error || "Error al registrar el dispositivo");
    }
  };

  const cerrarSesion = async () => {
  await supabase.auth.signOut();
  sessionStorage.removeItem("usuario");
  sessionStorage.removeItem("rol");
  router.push("/login");
};

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-2">PIXEL CRM</h1>

        <p className="text-gray-600 mb-8">
          Registro de dispositivos
        </p>
        <button
  type="button"
  onClick={cerrarSesion}
  className="mb-6 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
>
  Cerrar sesión
</button>

        <form onSubmit={registrar} className="space-y-4">
          <input
            name="imei"
            value={form.imei}
            onChange={manejarCambio}
            placeholder="IMEI"
            required
            className="w-full border p-3 rounded"
          />

          <input
            name="marca"
            value={form.marca}
            onChange={manejarCambio}
            placeholder="Marca"
            required
            className="w-full border p-3 rounded"
          />

          <input
            name="modelo"
            value={form.modelo}
            onChange={manejarCambio}
            placeholder="Modelo"
            required
            className="w-full border p-3 rounded"
          />

          <input
            name="almacenamiento"
            value={form.almacenamiento}
            onChange={manejarCambio}
            placeholder="Almacenamiento (ej. 256 GB)"
            required
            className="w-full border p-3 rounded"
          />

          <input
            name="color"
            value={form.color}
            onChange={manejarCambio}
            placeholder="Color"
            required
            className="w-full border p-3 rounded"
          />
          <input
  type="number"
  name="precio_compra"
  value={form.precio_compra}
  onChange={manejarCambio}
  placeholder="Precio de compra ($)"
  min="0"
  step="0.01"
  required
  className="w-full border p-3 rounded"
/>

<input
  type="number"
  name="precio_venta"
  value={form.precio_venta}
  onChange={manejarCambio}
  placeholder="Precio de venta ($)"
  min="0"
  step="0.01"
  required
  className="w-full border p-3 rounded"
/>

<select
  name="condicion"
  value={form.condicion}
  onChange={manejarCambio}
  className="w-full border p-3 rounded"
>
  <option value="NUEVO">NUEVO</option>
  <option value="USADO">USADO</option>
  <option value="REACONDICIONADO">REACONDICIONADO</option>
</select>

          <select
            name="estado"
            value={form.estado}
            onChange={manejarCambio}
            className="w-full border p-3 rounded"
          >
            <option value="DISPONIBLE">DISPONIBLE</option>
            <option value="VENDIDO">VENDIDO</option>
            <option value="RESERVADO">RESERVADO</option>
          </select>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded font-semibold"
          >
            Registrar dispositivo
          </button>
        </form>

        {mensaje && (
          <p className="mt-5 text-center font-semibold">{mensaje}</p>
        )}
      </div>
    </main>
  );
}
