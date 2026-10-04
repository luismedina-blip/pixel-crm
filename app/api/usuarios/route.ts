import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const correo = searchParams.get("correo");

    // Seguridad: no permitir consultar todos los usuarios
    if (!correo) {
      return NextResponse.json(
        { error: "El parámetro correo es obligatorio." },
        { status: 400 }
      );
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