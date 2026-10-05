"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();

    setCargando(true);
    setError("");

    try {
      // 1. Autenticar las credenciales
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: correo,
          password: password,
        });

      if (authError) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      // 2. Consultar nuestro backend para obtener rol y estado
      const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  throw new Error("No se pudo obtener la sesión.");
}

const respuesta = await fetch(
  `/api/usuarios?correo=${encodeURIComponent(correo)}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  }
);

      if (!respuesta.ok) {
        throw new Error("No se pudo consultar el usuario.");
      }

      const usuarios = await respuesta.json();

      const usuario = usuarios.find(
        (u: { correo: string }) => u.correo === correo
      );

      if (!usuario) {
        await supabase.auth.signOut();
        setError("El usuario no está registrado en PIXEL CRM.");
        return;
      }

      if (!usuario.activo) {
        await supabase.auth.signOut();
        setError("Este usuario se encuentra inactivo.");
        return;
      }

      // 3. Guardar datos necesarios para la interfaz
      sessionStorage.setItem("usuario", usuario.nombre);
      sessionStorage.setItem("rol", usuario.rol);

      // 4. Redireccionar según el rol
      if (usuario.rol === "administrador") {
        router.push("/");
      } else {
        router.push("/dispositivos");
      }
    } catch {
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-900">
          PIXEL CRM
        </h1>

        <p className="mt-2 text-gray-600">
          Inicio de sesión
        </p>

        <form onSubmit={iniciarSesion} className="mt-8">
          <label className="mb-2 block font-semibold">
            Correo electrónico
          </label>

          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@pixel.com"
            required
            className="mb-5 w-full rounded-lg border p-3"
          />

          <label className="mb-2 block font-semibold">
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mb-5 w-full rounded-lg border p-3"
          />

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-50"
          >
            {cargando ? "Validando credenciales..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}