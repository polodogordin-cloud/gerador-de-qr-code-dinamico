import { supabaseAdmin } from "@/lib/supabase";
import { normalizeDestination } from "@/lib/slug";

type Params = { params: Promise<{ slug: string }> };

const pageStyle = `
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         background: #f4f4f8; color: #1e1e2e; }
  .card { background: #fff; border-radius: 20px; padding: 40px 36px; max-width: 420px; width: calc(100% - 48px);
          text-align: center; box-shadow: 0 20px 60px rgba(30,30,60,.12); }
  .icon { font-size: 44px; line-height: 1; margin-bottom: 14px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  p { font-size: 14px; color: #5a5a72; line-height: 1.55; margin: 0; }
`;

function htmlPage(icon: string, title: string, message: string, status: number) {
  return new Response(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><style>${pageStyle}</style></head>
<body><div class="card"><div class="icon">${icon}</div><h1>${title}</h1><p>${message}</p></div></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const clean = (slug || "").toLowerCase().trim();

  if (!/^[a-z0-9]{4,16}$/.test(clean)) {
    return htmlPage("🔍", "QR Code inválido", "Este código não existe ou o endereço está errado.", 404);
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("plaquinhas")
    .select("destino, ativo, arquivada, nome")
    .eq("slug", clean)
    .maybeSingle();

  if (error) {
    console.error("Erro no redirect:", error);
    return htmlPage("⚠️", "Algo deu errado", "Não foi possível abrir este QR Code agora. Tente novamente em instantes.", 500);
  }

  if (!data) {
    return htmlPage("🔍", "QR Code não encontrado", "Esta plaquinha não existe ou foi removida.", 404);
  }

  if (!data.ativo || data.arquivada) {
    return htmlPage(
      "⏸️",
      "QR Code desativado",
      "Esta plaquinha está temporariamente fora do ar. Fale com o estabelecimento para mais informações.",
      410
    );
  }

  const destino = normalizeDestination(data.destino);
  if (!destino) {
    console.error("Destino inválido no banco para slug", clean);
    return htmlPage("⚠️", "Destino indisponível", "O endereço de destino desta plaquinha está inválido. Avise o estabelecimento.", 502);
  }

  // Contabiliza o scan (melhor esforço — não impede o redirect se falhar)
  try {
    await supabase.rpc("registrar_scan", { p_slug: clean });
  } catch (e) {
    console.error("Falha ao registrar scan:", e);
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: destino,
      "Cache-Control": "no-store",
    },
  });
}
