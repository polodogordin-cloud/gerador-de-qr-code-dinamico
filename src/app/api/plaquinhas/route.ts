import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/session";
import { generateSlug, normalizeDestination } from "@/lib/slug";
import { validateWifiInput } from "@/lib/wifi";

/** Cria uma nova plaquinha (tipo 'link' ou 'wifi'). */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: {
    tipo?: unknown;
    nome?: unknown;
    destino?: unknown;
    wifi_ssid?: unknown;
    wifi_senha?: unknown;
    wifi_seguranca?: unknown;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const tipo = body.tipo === "wifi" ? "wifi" : "link";
  const nomeRaw =
    typeof body.nome === "string" ? body.nome.trim().slice(0, 120) : "";

  let insertPayload: Record<string, unknown>;

  if (tipo === "wifi") {
    const wifi = validateWifiInput({
      ssid: body.wifi_ssid,
      senha: body.wifi_senha,
      seguranca: body.wifi_seguranca ?? "WPA",
    });
    if (!wifi.ok) {
      return NextResponse.json({ error: wifi.error }, { status: 422 });
    }
    insertPayload = {
      tipo: "wifi",
      nome: nomeRaw || `Wi-Fi ${wifi.ssid}`,
      destino: null,
      wifi_ssid: wifi.ssid,
      wifi_senha: wifi.senha,
      wifi_seguranca: wifi.seguranca,
      ativo: true,
    };
  } else {
    const nome = nomeRaw || "Sem nome";
    const destino =
      typeof body.destino === "string" ? normalizeDestination(body.destino) : null;

    if (!destino) {
      return NextResponse.json(
        { error: "Destino inválido. Use uma URL http(s) válida." },
        { status: 422 }
      );
    }
    insertPayload = {
      tipo: "link",
      nome,
      destino,
      wifi_ssid: null,
      wifi_senha: null,
      wifi_seguranca: "WPA",
      ativo: true,
    };
  }

  const supabase = supabaseAdmin();

  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = generateSlug(7);
    const { data, error } = await supabase
      .from("plaquinhas")
      .insert({ slug, ...insertPayload })
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
