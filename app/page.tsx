"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


  type Dispositivo = {
  id: number;
  imei: string;
  marca: string;
  modelo: string;
  almacenamiento: string;
  color: string;
  estado: string;
  precio_compra: number | null;
  precio_venta: number | null;
  condicion: string | null;
};
export default function Home() {
const router = useRouter();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rol, setRol] = useState("");
  useEffect(() => {
  const rolGuardado = sessionStorage.getItem("rol");
  setRol(rolGuardado || "");

  async function cargarDispositivos() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
const token = sessionData.session?.access_token;

if (!token) {
  router.push("/login");
  return;
}

const respuesta = await fetch("/api/dispositivos", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const datos = await respuesta.json();

      setDispositivos(datos);
    } catch (error) {
      console.error("Error al cargar dispositivos:", error);
    } finally {
      setCargando(false);
    }
  }

  cargarDispositivos();
}, []);
const cerrarSesion = () => {
  sessionStorage.removeItem("usuario");
  sessionStorage.removeItem("rol");
  router.push("/login");
};
const venderDispositivo = async (id: number) => {
  const confirmar = window.confirm(
    "¿Seguro que deseas marcar este dispositivo como vendido?"
  );

  if (!confirmar) return;

  const { data, error } = await supabase
  .from("dispositivos")
  .update({ estado: "VENDIDO" })
  .eq("id", id)
  .select();

console.log("Resultado venta:", data);
console.log("Error venta:", error);
  if (error) {
    alert("Error al vender el dispositivo: " + error.message);
    return;
  }

  setDispositivos((anteriores) =>
    anteriores.map((dispositivo) =>
      dispositivo.id === id
        ? { ...dispositivo, estado: "VENDIDO" }
        : dispositivo
    )
  );

  alert("Dispositivo vendido correctamente");
};
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Barra superior */}
      <header className="bg-gray-900 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-5">
          <div>
            <h1 className="text-2xl font-bold">PIXEL CRM</h1>
            <p className="text-sm text-gray-300">
              Sistema de Gestión de Inventario
            </p>
          </div>

          <nav className="flex gap-3">
           
            <Link
              href="/"
              className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900"
            >
              Inicio
            </Link>

            <Link
              href="/dispositivos"
              className="rounded-lg bg-gray-700 px-4 py-2 font-semibold hover:bg-gray-600"
            >
              Registrar dispositivo
            </Link>

            {rol === "administrador" && (
            <Link
              href="/usuarios"
              className="rounded-lg bg-gray-700 px-4 py-2 font-semibold hover:bg-gray-600"
  >
               Usuarios
             </Link>
)}

<button
  onClick={cerrarSesion}
  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
>
  Cerrar sesión
</button>

</nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-8">
        {/* Resumen */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Total dispositivos</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {dispositivos.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Disponibles</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {
                dispositivos.filter(
                (dispositivo) =>
               dispositivo.estado?.trim().toUpperCase() === "DISPONIBLE"
              ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Sistema</p>
            <p className="mt-2 text-xl font-bold text-green-600">
              ACTIVO
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Dispositivos registrados
            </h2>

            <Link
              href="/dispositivos"
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              + Nuevo dispositivo
            </Link>
          </div>

          {cargando ? (
            <p className="text-gray-600">Cargando dispositivos...</p>
          ) : dispositivos.length === 0 ? (
            <p className="text-gray-600">
              No hay dispositivos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                
                  <thead>
 <tr className="border-b bg-gray-50 text-left">
    <th className="p-3">IMEI</th>
    <th className="p-3">Marca</th>
    <th className="p-3">Modelo</th>
    <th className="p-3">Almacenamiento</th>
    <th className="p-3">Color</th>
    <th className="p-3">Condición</th>
    <th className="p-3">Compra</th>
    <th className="p-3">Venta</th>
    <th className="p-3">Ganancia</th>
    <th className="p-3">Estado</th>
    <th className="p-3">Acción</th>

  </tr>
</thead>
<tbody>
  {dispositivos.map((dispositivo) => (
    <tr
      key={dispositivo.id}
      className="border-b text-gray-700 hover:bg-gray-50"
    >
                <td className="p-3">{dispositivo.imei}</td>
<td className="p-3">{dispositivo.marca}</td>
<td className="p-3">{dispositivo.modelo}</td>
<td className="p-3">{dispositivo.almacenamiento}</td>
<td className="p-3">{dispositivo.color}</td>

<td className="p-3">
  {dispositivo.condicion ?? "-"}
</td>

<td className="p-3">
  {dispositivo.precio_compra !== null
    ? `$${Number(dispositivo.precio_compra).toFixed(2)}`
    : "-"}
</td>

<td className="p-3">
  {dispositivo.precio_venta !== null
    ? `$${Number(dispositivo.precio_venta).toFixed(2)}`
    : "-"}
</td>

<td className="p-3 font-semibold">
  {dispositivo.precio_compra !== null &&
  dispositivo.precio_venta !== null
    ? `$${(
        Number(dispositivo.precio_venta) -
        Number(dispositivo.precio_compra)
      ).toFixed(2)}`
    : "-"}
</td>

<td className="p-3">
  {dispositivo.estado}
</td>
                
  <td className="p-3">
  {dispositivo.estado?.trim().toUpperCase() === "DISPONIBLE" ? (
    <button
  onClick={() => venderDispositivo(dispositivo.id)}
  className="bg-green-600 text-white px-3 py-1 rounded font-semibold hover:bg-green-700"
>
  Vender
</button>
  ) : (
    <span className="text-gray-500">Vendido</span>
  )}
</td>                    
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}