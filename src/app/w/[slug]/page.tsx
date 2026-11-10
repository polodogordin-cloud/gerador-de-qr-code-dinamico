import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import WifiConnect from "@/components/WifiConnect";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Conecte-se ao Wi-Fi",
};

type Params = { params: Promise<{ slug: string }> };

function PublicMessage({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: "search" | "pause";
}) {
  return (
    <main className="wifi-page">
      <div className="wifi-card wifi-card-center">
        <div className="wifi-big-icon wifi-big-icon-muted">
          {icon === "search" ? (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
          ) : (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M10 9.5v5" /><path d="M14 9.5v5" />
            </svg>
          )}
        </div>
        <h1 className="wifi-title">{title}</h1>
        <p className="wifi-sub">{message}</p>
      </div>
    </main>
  );
}

export default async function WifiPage({ params }: Params) {
  const { slug } = await params;
  const clean = (slug || "").toLowerCase().trim();

  if (!/^[a-z0-9]{4,16}$/.test(clean)) {
    return (
      <PublicMessage
        icon="search"
        title="QR Code inválido"
        message="Este código não existe ou o endereço está errado."
      />
    );
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("plaquinhas")
    .select("nome, ativo, arquivada, tipo, wifi_ssid, wifi_senha, wifi_seguranca")
    .eq("slug", clean)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar Wi-Fi:", error);
    return (
      <PublicMessage
        icon="pause"
        title="Algo deu errado"
        message="Não foi possível carregar os dados do Wi-Fi agora. Tente novamente em instantes."
      />
    );
  }

  if (!data) {
    return (
      <PublicMessage
        icon="search"
        title="QR Code não encontrado"
        message="Esta plaquinha não existe ou foi removida."
      />
    );
  }

  if (!data.ativo || data.arquivada) {
    return (
      <PublicMessage
        icon="pause"
        title="Wi-Fi desativado"
        message="Esta plaquinha de Wi-Fi está temporariamente fora do ar. Fale com um atendente."
      />
    );
  }

  if (data.tipo !== "wifi") {
    // Placa de link — segue o fluxo normal de redirecionamento
    redirect(`/r/${clean}`);
  }

  return (
    <WifiConnect
      nome={data.nome as string}
      ssid={(data.wifi_ssid as string) ?? ""}
      senha={(data.wifi_senha as string | null) ?? null}
      seguranca={(data.wifi_seguranca as "WPA" | "WEP" | "ABERTA") ?? "WPA"}
    />
  );
}
