import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/session";
import { generateSlug, normalizeDestination } from "@/lib/slug";

/** Cria uma nova plaquinha. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: { nome?: unknown; destino?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const nome =
    typeof body.nome === "string" && body.nome.trim()
      ? body.nome.trim().slice(0, 120)
      : "Sem nome";
  const destino =
    typeof body.destino === "string" ? normalizeDestination(body.destino) : null;

  if (!destino) {
    return NextResponse.json(
      { error: "Destino inválido. Use uma URL http(s) válida." },
      { status: 422 }
    );
  }

  const supabase = supabaseAdmin();

  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = generateSlug(7);
    const { data, error } = await supabase
      .from("plaquinhas")
      .insert({ slug, nome, destino, ativo: true })
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ plaquinha: data }, { status: 201 });
    }
    // Colisão de slug (unique) → tenta outra
    if (error && error.code !== "23505") {
      console.error("Erro ao criar plaquinha:", error);
      return NextResponse.json(
        { error: "Erro ao criar a plaquinha." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Não foi possível gerar um código único. Tente de novo." },
    { status: 500 }
  );
}
