import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/session";
import { normalizeDestination } from "@/lib/slug";
import { validateWifiInput } from "@/lib/wifi";

type Params = { params: Promise<{ id: string }> };

type PatchBody = {
  nome?: unknown;
  destino?: unknown;
  ativo?: unknown;
  arquivada?: unknown;
  travada?: unknown;
  wifi_ssid?: unknown;
  wifi_senha?: unknown;
  wifi_seguranca?: unknown;
};

/** Atualiza uma plaquinha (link, Wi-Fi, nome, ativo, arquivada, travada). */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: PatchBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: current, error: fetchError } = await supabase
    .from("plaquinhas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Erro ao buscar plaquinha:", fetchError);
    return NextResponse.json({ error: "Erro ao buscar a plaquinha." }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json({ error: "Plaquinha não encontrada." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};

  const wantsNome = body.nome !== undefined;
  const wantsDestino = body.destino !== undefined;
  const wantsArquivada = body.arquivada !== undefined;
  const wantsWifi =
    body.wifi_ssid !== undefined ||
    body.wifi_senha !== undefined ||
    body.wifi_seguranca !== undefined;

  if (wantsDestino && wantsWifi) {
    return NextResponse.json(
      { error: "Envie destino OU dados de Wi-Fi — nunca os dois na mesma alteração." },
      { status: 422 }
    );
  }

  // Placa travada bloqueia edições de conteúdo (nome/destino/Wi-Fi/arquivamento).
  // O interruptor de atividade (ativo) continua liberado como “botão de emergência”.
  if (current.travada && (wantsNome || wantsDestino || wantsArquivada || wantsWifi)) {
    return NextResponse.json(
      { error: "Esta plaquinha está travada. Destrave antes de editar." },
      { status: 409 }
    );
  }

  const currentTipo = current.tipo === "wifi" ? "wifi" : "link";

  if (wantsDestino && currentTipo === "wifi") {
    return NextResponse.json(
      { error: "Esta plaquinha é de Wi-Fi. Edite os dados da rede em vez do destino." },
      { status: 422 }
    );
  }
  if (wantsWifi && currentTipo !== "wifi") {
    return NextResponse.json(
      { error: "Esta plaquinha é de link. Use o campo destino." },
      { status: 422 }
    );
  }

  if (wantsNome) {
    if (typeof body.nome !== "string") {
      return NextResponse.json({ error: "Nome inválido." }, { status: 422 });
    }
    update.nome = body.nome.trim().slice(0, 120) || "Sem nome";
  }

  if (wantsDestino) {
    const destino =
      typeof body.destino === "string" ? normalizeDestination(body.destino) : null;
    if (!destino) {
      return NextResponse.json(
        { error: "Destino inválido. Use uma URL http(s) válida." },
        { status: 422 }
      );
    }
    update.destino = destino;
  }

  if (wantsWifi) {
    const wifi = validateWifiInput({
      ssid: body.wifi_ssid !== undefined ? body.wifi_ssid : current.wifi_ssid,
      senha: body.wifi_senha !== undefined ? body.wifi_senha : current.wifi_senha,
      seguranca:
        body.wifi_seguranca !== undefined ? body.wifi_seguranca : current.wifi_seguranca ?? "WPA",
    });
    if (!wifi.ok) {
      return NextResponse.json({ error: wifi.error }, { status: 422 });
    }
    update.wifi_ssid = wifi.ssid;
    update.wifi_senha = wifi.senha;
    update.wifi_seguranca = wifi.seguranca;
  }

  if (body.ativo !== undefined) {
    if (typeof body.ativo !== "boolean") {
      return NextResponse.json({ error: "Campo 'ativo' inválido." }, { status: 422 });
    }
    update.ativo = body.ativo;
  }

  if (wantsArquivada) {
    if (typeof body.arquivada !== "boolean") {
      return NextResponse.json({ error: "Campo 'arquivada' inválido." }, { status: 422 });
    }
    update.arquivada = body.arquivada;
  }

  if (body.travada !== undefined) {
    if (typeof body.travada !== "boolean") {
      return NextResponse.json({ error: "Campo 'travada' inválido." }, { status: 422 });
    }
    update.travada = body.travada;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("plaquinhas")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar plaquinha:", error);
    return NextResponse.json({ error: "Erro ao salvar as alterações." }, { status: 500 });
  }

  return NextResponse.json({ plaquinha: data });
}

/** Exclui definitivamente uma plaquinha. Bloqueado quando travada. */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: current, error: fetchError } = await supabase
    .from("plaquinhas")
    .select("id, travada")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Erro ao buscar plaquinha:", fetchError);
    return NextResponse.json({ error: "Erro ao buscar a plaquinha." }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json({ error: "Plaquinha não encontrada." }, { status: 404 });
  }
  if (current.travada) {
    return NextResponse.json(
      { error: "Esta plaquinha está travada. Destrave antes de excluir." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("plaquinhas").delete().eq("id", id);
  if (error) {
    console.error("Erro ao excluir plaquinha:", error);
    return NextResponse.json({ error: "Erro ao excluir a plaquinha." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
