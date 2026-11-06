import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/session";
import { normalizeBaseUrl } from "@/lib/slug";

/** Atualiza a URL base (domínio) usada para montar os QR Codes. */
export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: { base_url?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const baseUrl =
    typeof body.base_url === "string" ? normalizeBaseUrl(body.base_url) : null;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "URL base inválida. Use algo como https://meusite.vercel.app" },
      { status: 422 }
    );
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("settings")
    .update({ base_url: baseUrl })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar settings:", error);
    return NextResponse.json(
      { error: "Erro ao salvar a URL base." },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: data });
}
