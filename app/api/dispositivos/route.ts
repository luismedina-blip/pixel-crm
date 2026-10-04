import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("dispositivos")
    .select("*");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
export async function POST(request: Request) {
  try {
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
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}