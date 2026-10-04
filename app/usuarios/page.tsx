"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

useEffect(() => {
  const rol = sessionStorage.getItem("rol");

  if (rol !== "administrador") {
    router.replace("/dispositivos");
  }
}, [router]);

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const respuesta = await fetch("/api/usuarios");
        const datos = await respuesta.json();
        setUsuarios(datos);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">PIXEL CRM</h1>

        <p className="text-gray-600 mb-8">
          Gestión de usuarios
        </p>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-6">
            Usuarios registrados
          </h2>

          {cargando ? (
            <p>Cargando usuarios...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Correo</th>
                    <th className="text-left p-3">Rol</th>
                    <th className="text-left p-3">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b">
                      <td className="p-3">{usuario.id}</td>
                      <td className="p-3">{usuario.nombre}</td>
                      <td className="p-3">{usuario.correo}</td>
                      <td className="p-3">{usuario.rol}</td>
                      <td className="p-3">
                        {usuario.activo ? "ACTIVO" : "INACTIVO"}
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