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
    precio_compra: Number(precio_compra),
    precio_venta: Number(precio_venta),
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