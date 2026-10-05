import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // A07 - Fallas de autenticación:
// Exigir una sesión válida antes de consultar datos del usuario.
const authorization = request.headers.get("authorization");

if (!authorization?.startsWith("Bearer ")) {
  return NextResponse.json(
    { error: "No autorizado. Se requiere autenticación." },
    { status: 401 }
  );
}

const token = authorization.substring(7);

const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser(token);

if (authError || !user) {
  return NextResponse.json(
    { error: "Sesión inválida o expirada." },
    { status: 401 }
  );
}
    const { searchParams } = new URL(request.url);
    const correo = searchParams.get("correo");

    // Seguridad: no permitir consultar todos los usuarios
    if (!correo) {
  // Solo un administrador autenticado puede consultar
  // la lista completa de usuarios.
  const { data: usuarioActual, error: rolError } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("correo", user.email)
    .single();

  if (
    rolError ||
    !usuarioActual ||
    usuarioActual.rol !== "administrador"
  ) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el administrador puede consultar usuarios." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, correo, rol, activo");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron obtener los usuarios." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

    // Principio de mínima exposición:
    // devolver únicamente los datos necesarios para el login
    const { data, error } = await supabase
      .from("usuarios")
      .select("nombre, correo, rol, activo")
      .eq("correo", correo)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo consultar el usuario." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}