import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import type { Plaquinha } from "@/lib/types";
import Panel from "@/components/Panel";

export const dynamic = "force-dynamic";

async function getBaseUrl(): Promise<string> {
  try {
    const supabase = supabaseAdmin();
    const { data } = await supabase
      .from("settings")
      .select("base_url")
      .eq("id", 1)
      .maybeSingle();
    if (data?.base_url) return data.base_url.replace(/\/+$/, "");
  } catch (e) {
    console.error("Falha ao carregar base_url:", e);
  }
  return "https://plaquinhas-qr-nine.vercel.app";
}

export default async function PanelPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const supabase = supabaseAdmin();
  const [{ data: plaques }, baseUrl] = await Promise.all([
    supabase
      .from("plaquinhas")
      .select("*")
      .order("criado_em", { ascending: false })
      .then((r) => r),
    getBaseUrl(),
  ]);

  return (
    <Panel
      initialPlaques={(plaques ?? []) as Plaquinha[]}
      initialBaseUrl={baseUrl}
    />
  );
}
