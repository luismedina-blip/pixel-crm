import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request: Request) {
  try {
    // Obtener el token enviado por el usuario autenticado
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere autenticación." },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);

    // Validar el token con Supabase
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

    // Solo después de autenticar se consulta el inventario
    const { data, error } = await supabase
      .from("dispositivos")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron obtener los dispositivos." },
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
export async function POST(request: Request) {
  try {
    // Verificar autenticación antes de permitir registrar dispositivos
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
  // A01 - Broken Access Control:
// Verificar en el servidor que solo el administrador
// pueda registrar nuevos dispositivos.
const { data: usuarioRol, error: rolError } = await supabase
  .from("usuarios")
  .select("rol")
  .eq("correo", user.email)
  .single();

if (rolError || !usuarioRol) {
  console.warn(
  `[SEGURIDAD][A09] Acceso denegado - usuario: ${user.email ?? "desconocido"}`
);
  return NextResponse.json(
    { error: "No se pudo verificar el rol del usuario." },
    { status: 403 }
  );
}

if (usuarioRol.rol !== "administrador") {
  console.warn(
  `[SEGURIDAD][A09] Intento de acceso sin permisos - usuario: ${user.email ?? "desconocido"}, rol: ${usuarioRol.rol}`
);
  return NextResponse.json(
    { error: "Acceso denegado. Solo el administrador puede registrar dispositivos." },
    { status: 403 }
  );
}
    const body = await request.json();

    const {
  imei,
  marca,
  modelo,
  almacenamiento,
  color,
  estado,
  precio_compra,
  precio_venta,
  condicion,
} = body;
// Validación de seguridad de los datos recibidos
if (
  !imei ||
  !marca ||
  !modelo ||
  !almacenamiento ||
  !color ||
  !estado ||
  !condicion
) {
  return NextResponse.json(
    { error: "Todos los campos obligatorios deben ser completados." },
    { status: 400 }
  );
}

// Validar formato del IMEI: únicamente números y máximo 15 dígitos
if (!/^\d{1,15}$/.test(String(imei))) {
  return NextResponse.json(
    { error: "El IMEI debe contener únicamente números y máximo 15 dígitos." },
    { status: 400 }
  );
}

// Validar precios
const compra = Number(precio_compra);
const venta = Number(precio_venta);

if (
  !Number.isFinite(compra) ||
  !Number.isFinite(venta) ||
  compra < 0 ||
  venta < 0
) {
  return NextResponse.json(
    { error: "Los precios deben ser valores numéricos válidos y no negativos." },
    { status: 400 }
  );
}
    const { data, error } = await supabase
      .from("dispositivos")
      .insert([
  {
    imei,
    marca,
    modelo,
    almacenamiento,
    color,
    estado,
    precio_compra: compra,
    precio_venta: venta,
    condicion,
  },
])
.select();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo registrar el dispositivo." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}